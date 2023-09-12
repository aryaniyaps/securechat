import { z } from "zod";
import { attachmentFileSchema } from "./attachment";

export const messageSchema = z.object({
  id: z.string(),
  content: z.string(),
  roomId: z.string(),
  ownerId: z.string(),
  attachments: z.array(attachmentFileSchema),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  owner: z.object({
    name: z.string().nullish(),
    username: z.string(),
    image: z.string().nullable(),
    createdAt: z.date(),
  }),
});

export type Message = z.infer<typeof messageSchema>;
