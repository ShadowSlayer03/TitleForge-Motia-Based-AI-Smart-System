import z from "zod";

export const EventDataSchema = z.object({
  jobId: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  channelId: z.string().min(1, "Channel ID is required").optional(),
  channelName: z.string().min(1, "Channel name is required").optional(),
});

export type EventData = z.infer<typeof EventDataSchema>;
