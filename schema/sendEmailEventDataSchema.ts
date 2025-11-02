import z from "zod";

export const SendEmailEventSchema = z.object({
    jobId: z.string().min(1, "Job ID is required"),
    email: z.string().email("A valid recipient email is required"),
    channelName: z.string().min(1, "Channel name is required"),
    channelId: z.string().min(1, "Channel ID is required"),
    improvedTitles: z
        .array(
            z.object({
                original: z.string().min(5, "Original title must be at least 5 characters long"),
                improved: z.string().min(5, "Improved title must be at least 5 characters long"),
                rationale: z.string().min(10, "Rationale must be at least 10 characters long"),
                url: z.string().url()
            })
        )
        .nonempty("At least one improved title object is required"),
});

export type SendEmailEvent = z.infer<typeof SendEmailEventSchema>;
