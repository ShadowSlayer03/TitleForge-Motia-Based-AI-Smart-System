import { SendEmailEvent, SendEmailEventSchema } from "../schema/sendEmailEventDataSchema";
import { generateEmailText } from "../util/utils";

export const config = {
    name: "SendEmail",
    type: "event",
    subscribes: ["yt.titles.ready"],
    emits: ["yt.email.sent", "yt.email.error"]
}

export const handler = async (eventData: any, { emit, logger, state }: any) => {
    let jobId: string | undefined;
    let channelName: string | undefined;
    let email: string | undefined;

    try {
        const data: SendEmailEvent = SendEmailEventSchema.parse(eventData);

        jobId = data.jobId;
        channelName = data.channelName;
        email = data.email;

        const { channelId, improvedTitles } = data;

        logger.info("Sending email...", { jobId, email, titleCount: improvedTitles.length });

        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

        if (!RESEND_API_KEY) {
            throw new Error("Resend API Key not configured!");
        }

        if (!RESEND_FROM_EMAIL) {
            throw new Error("Resend from email not configured!");
        }

        const jobData = await state.get(`job: ${jobId}`);
        await state.set(`job: ${jobId}`, {
            ...jobData,
            status: "sending email"
        });

        const emailText = generateEmailText(channelId, channelName, email, improvedTitles);

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: RESEND_FROM_EMAIL,
                to: [email],
                subject: `Your AI-optimized titles for ${channelName}`,
                html: emailText
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                `Resend API error: ${errorData?.message}` || "Unknown Email Error"
            );
        }

        const emailResult = await response.json();

        logger.info("Email sent successfully!", { jobId, emailId: emailResult.id });

        await state.set(`job: ${jobId}`, {
            ...jobData,
            status: "completed",
            improvedTitles,
            completedAt: new Date().toISOString()
        });

        await emit({
            topic: "yt.email.sent",
            data: {
                jobId,
                emailId: emailResult.id,
                email,
            }
        });

    } catch (error: any) {
        logger.error("Error in send email handler.", { error: error.message });

        if (!jobId) {
            logger.error("Cannot send error notification - missing JobId");
        }

        const jobData = await state.get(`job: ${jobId}`);

        await state.set(`job: ${jobId}`, {
            ...jobData,
            status: "failed",
            error: error?.message
        })

        await emit({
            topic: "yt.email.error",
            data: {
                jobId,
                channelName,
                email,
                error: "Failed to send email. Please try again!",
            }
        })
    }

}