import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { broadcastEvent } from "~/server/config/amqp";
import { typingUserSchema } from "../../../schemas/typing";

export const typingRouter = createTRPCRouter({
  addUser: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      broadcastEvent({
        event: "add_typing_user",
        payload: typingUserSchema.parse(ctx.session.user),
        roomId: input.roomId,
      });
    }),

  removeUser: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      broadcastEvent({
        event: "remove_typing_user",
        payload: typingUserSchema.parse(ctx.session.user),
        roomId: input.roomId,
      });
    }),
});
