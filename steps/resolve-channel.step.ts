import { EventData, EventDataSchema } from "../schema/resolveChannelEventDataSchema";

// Converts YT handle/name to channel ID using YT data API
export const config = {
    name: "ResolveChannel",
    type: "event",
    subscribes: ["yt.submit"],
    emits: ["yt.channel.resolved", "yt.channel.error"],
};

export const handler = async (eventData: any, { emit, logger, state }: any) => {
    let jobId: string | undefined;
    let email: string | undefined;

    try {
        const data: EventData = EventDataSchema.parse(eventData);
        jobId = data.jobId;
        email = data.email;

        const { channel } = data;

        logger.info("Resolving YT channel...", {
            jobId,
            channel
        });

        const YT_API_KEY = process.env.YOUTUBE_API_KEY;

        if (!YT_API_KEY) {
            throw new Error("Youtube API key not configured!");
        }

        const jobData = await state.get(`job: ${jobId}`);
        await state.set(`job: ${jobId}`, {
            ...jobData,
            status: "Resolving channel"
        });

        let channelId: string | null = null;
        let channelName: string = "";

        if (channel.startsWith("@")) {
            const handle = channel.substring(1);

            const searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&key=${YT_API_KEY}`;

            const searchResponse = await fetch(searchURL);
            const searchData = await searchResponse.json();

            if (searchData.items && searchData.items.length > 0) {
                channelId = searchData.items[0].snippet.channelId;
                channelName = searchData.items[0].snippet.title;
            }
        } else {
            const searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${channel}&key=${YT_API_KEY}`;

            const searchResponse = await fetch(searchURL);
            const searchData = await searchResponse.json();

            if (searchData.items && searchData.items.length > 0) {
                channelId = searchData.items[0].snippet.channelId;
                channelName = searchData.items[0].snippet.title;
            }
        }

        if (!channelId) {
            logger.error("Channel not found!", { channel });
            await state.set(`job: ${jobId}`, {
                ...jobData,
                status: "failed",
                error: "channel not found"
            });


            await emit({
                topic: "yt.channel.error",
                data: {
                    jobId,
                    email,
                    error: "No videos found for this channel"
                }
            });

            return;
        }

        await emit({
            topic: "yt.channel.resolved",
            data: {
                jobId,
                channelId,
                channelName,
                email,
            }
        });

        return;

    } catch (error: any) {
        logger.error("Error in resolve channel handler.", { error: error.message });

        if (!jobId || !email) {
            logger.error("Cannot send error notification - missing JobId or Email");
        }

        const jobData = await state.get(`job: ${jobId}`);

        await state.set(`job: ${jobId}`, {
            ...jobData,
            status: "failed",
            error: error.message
        })

        await emit({
            topic: "yt.channel.error",
            data: {
                jobId,
                email,
                error: "Failed to resolve channel. Please try again!"
            }
        })
    }
};
