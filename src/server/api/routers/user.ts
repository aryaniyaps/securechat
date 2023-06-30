import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        name: z.optional(z.string()),
        username: z.optional(z.string()),
        avatar: z.optional(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // upload avatar here
      return await ctx.prisma.user.update({
        data: { username: input.username, name: input.name },
        where: { id: ctx.session.user.id },
      });
    }),

  fetch: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user;
  }),
});
