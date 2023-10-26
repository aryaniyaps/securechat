import { z } from "zod";
import { ownerSchema } from "./user";

export const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
  owner: ownerSchema,
});

export type Room = z.infer<typeof roomSchema>;
