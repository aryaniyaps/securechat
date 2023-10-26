import { z } from "zod";
import { attachmentFileSchema } from "./attachment";
import { ownerSchema } from "./user";

export const messageSchema = z.object({
  id: z.string(),
  content: z.string().nullable(),
  roomId: z.string(),
  ownerId: z.string(),
  attachments: z.array(attachmentFileSchema),
  isEdited: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  owner: ownerSchema,
});

export const messageCreateSchema = messageSchema.extend({
  nonce: z.string().nullable(),
});

export type Message = z.infer<typeof messageSchema>;

export type MessageCreatePayload = z.infer<typeof messageCreateSchema>;
