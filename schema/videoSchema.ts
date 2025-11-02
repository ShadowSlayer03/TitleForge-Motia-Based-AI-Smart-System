import z from "zod";

const VideoSchema = z.object({
  videoId: z.string().min(1, "Video ID is required"),
  title: z.string().min(1, "Video title is required"),
  url: z.string().url("Invalid video URL"),
  publishedAt: z.string().datetime("Invalid date format"),
  thumbnail: z.string().url("Invalid thumbnail URL"),
});

export default VideoSchema;
