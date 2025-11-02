import { z } from "zod";

const submitSchema = z.object({
  channel: z
    .string()
    .trim()
    .min(2, "Channel name must be at least 2 characters long.")
    .max(100, "Channel name is too long."),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address."),
});

export default submitSchema;