import { z } from "zod";

export const typingUserSchema = z.object({
  id: z.string(),
  username: z.string(),
});

export type TypingUser = z.infer<typeof typingUserSchema>;
