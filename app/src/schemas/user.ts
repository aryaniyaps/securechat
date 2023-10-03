import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string().nullish(),
  image: z.string().nullable(),
  username: z.string(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export type User = z.infer<typeof userSchema>;
