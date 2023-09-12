import { z } from "zod";

export const attachmentFileSchema = z.object({
    name: z.string(),
    contentType: z.string(),
    uri: z.string()
})

export type AttachmentFile = z.infer<typeof attachmentFileSchema>;