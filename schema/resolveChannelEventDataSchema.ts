import z from "zod";

export const EventDataSchema = z.object({
  jobId: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  channel: z.string().min(1, "Channel name or handle is required"),
});

export type EventData = z.infer<typeof EventDataSchema>;