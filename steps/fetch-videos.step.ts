import { EventData, EventDataSchema } from "../schema/fetchVideosEventDataSchema";

// Fetches videos based on the channelId/channel name
export const config = {
    name: "FetchVideos",
    type: "event",
    subscribes: ["yt.channel.resolved"],
    emits: ["yt.videos.fetched", "yt.videos.error"],
};

interface Video {
    videoId: string;
    title: string;
    url: string;
    publishedAt: string;
    thumbnail: string;
}

export const handler = async (eventData: any, { emit, logger, state }: any) => {
    let jobId: string | undefined;
    let email: string | undefined;
    let channelName: string | undefined;

    try {
        const data: EventData = EventDataSchema.parse(eventData);

        jobId = data.jobId;
        email = data.email;
        channelName = data.channelName;

        const { channelId } = data;

        if (!channelId && !channelName) {
            throw new Error("Either channelId or channelName must be provided");
        }

        logger.info("Fetching channel videos...", { jobId, channelId, channelName })

        const YT_API_KEY = process.env.YOUTUBE_API_KEY;

        if (!YT_API_KEY) {
            throw new Error("Youtube API key not configured!");
        }

        const jobData = await state.get(`job: ${jobId}`);
        await state.set(`job: ${jobId}`, {
            ...jobData,
            status: "fetching videos"
        });

        const searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=5&key=${YT_API_KEY}`;

        const searchResponse = await fetch(searchURL);
        const videosData = await searchResponse.json();

        if (!videosData.items || videosData.items.length === 0) {
            logger.warn("No videos found for the channel", { jobId, channelId });

            await state.set(`job: ${jobId}`, {
                ...jobData,
                status: "failed",
                error: "No videos found"
            });

            await emit({
                topic: "yt.videos.error",
                data: {
                    jobId,
                    email,
                }
            });

            return;
        }

        const videos: Video[] = videosData.items.map((item: any) => (
            {
                videoId: item.id.videoId,
                title: item.snippet.title,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                publishedAt: item.snippet.publishedAt,
                thumbnail: item.snippet.thumbnails.default.url
            }
        ));

        logger.info("Videos fetched successfully", {
            jobId,
            videoCount: videos.length
        })

        await state.set(`job: ${jobId}`, {
            ...jobData,
            status: "videos fetched",
            error: videos
        })

        await emit({
            topic: "yt.videos.fetched",
            data: {
                jobId,
                channelName,
                channelId,
                videos,
                email,
            }
        });

        return;


    } catch (error: any) {
        logger.error("Error in fetching videos handler.", { error: error.message });

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
            topic: "yt.videos.error",
            data: {
                jobId,
                email,
                channelName,
                error: "Failed to fetch videos. Please try again!"
            }
        })
    }

}