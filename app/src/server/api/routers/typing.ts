import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { wsServerApi } from "~/server/config/wsServer";
import { typingUserSchema } from "../../../schemas/typing";

export const typingRouter = createTRPCRouter({
  addUser: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await wsServerApi.post("/broadcast-event", {
        type: "ADD_TYPING_USER",
        payload: typingUserSchema.parse(ctx.session.user),
        roomId: input.roomId,
      });

      return;
    }),

  removeUser: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await wsServerApi.post("/broadcast-event", {
        type: "REMOVE_TYPING_USER",
        payload: typingUserSchema.parse(ctx.session.user),
        roomId: input.roomId,
      });

      return;
    }),
});
