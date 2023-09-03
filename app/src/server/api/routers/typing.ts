import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { wsServerApi } from "~/server/config/wsServer";

export const typingRouter = createTRPCRouter({
  addUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        roomId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // add typing user here

      // broadcast message here
      await wsServerApi.post("/broadcast-event", {
        type: "CREATE_MESSAGE",
        payload: {},
        roomId: input.roomId,
      });

      return;
    }),
});
