import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        username: z.optional(z.string()),
        avatar: z.optional(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // upload avatar here
      return await ctx.prisma.user.update({
        data: { username: input.username },
        where: { id: ctx.session.user.id },
      });
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
