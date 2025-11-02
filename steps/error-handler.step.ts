import { generateEmailErrorText } from "../util/utils";

export const config = {
    name: "ErrorHandler",
    type: "event",
    subscribes: ["yt.channel.error", "yt.email.error", "yt.videos.error", "yt.titles.error"],
    emits: ["yt.error.notified"]
}

export const handler = async (eventData: any, { emit, logger, state }: any) => {
    let jobId: string | undefined;

    try {
        const data = eventData || {};

        jobId = data.jobId;
        const email = data.email;
        const channelName = data.channelName;
        const error = data.error;

        logger.info("Handling error notification", {
            jobId,
            email
        });

        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

        if (!RESEND_API_KEY) {
            logger.error("Resend API Key not configured!");
            throw new Error("Resend API Key not configured!");
        }

        if (!RESEND_FROM_EMAIL) {
            logger.error("Resend FROM EMAIL not configured!");
            throw new Error("Resend FROM EMAIL not configured!");
        }

        const emailText = generateEmailErrorText(channelName, error);

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: RESEND_FROM_EMAIL,
                to: [email],
                subject: `Request failed for ${channelName}`,
                html: emailText
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                `Resend API error: ${errorData.message}` || "Unknown Email Error"
            );
        }

        const emailResult = await response.json();

        await emit({
            topic: "yt.error.notified",
            data: {
                jobId,
                email,
                emailId: emailResult.id
            }
        });

        return;
    } catch (error: any) {
        logger.error("Failed to send error notification!", { error: error.message })
    }

}