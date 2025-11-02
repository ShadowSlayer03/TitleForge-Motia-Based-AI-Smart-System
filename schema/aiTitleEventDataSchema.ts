import z from "zod";
import VideoSchema from "./videoSchema";

export const EventDataSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  email: z.string().email("A valid email is required"),
  channelName: z.string().min(1, "Channel name is required"),
  channelId: z.string().min(1, "Channel ID is required"),
  videos: z
    .array(VideoSchema)
    .nonempty("At least one video must be provided"),
});

export type EventData = z.infer<typeof EventDataSchema>;