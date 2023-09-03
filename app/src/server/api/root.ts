import { createTRPCRouter } from "~/server/api/trpc";
import { messageRouter } from "./routers/message";
import { roomRouter } from "./routers/room";
import { typingRouter } from "./routers/typing";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  room: roomRouter,
  message: messageRouter,
  typing: typingRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
