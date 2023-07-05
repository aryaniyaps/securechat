import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const messageSchema = z.object({
  id: z.string(),
  content: z.string(),
  roomId: z.string(),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const messageRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        roomId: z.string(),
      })
    )
    .output(messageSchema)
    .mutation(async ({ ctx, input }) => {
      // create message here
      return await ctx.prisma.message.create({
        data: {
          content: input.content,
          roomId: input.roomId,
          ownerId: ctx.session.user.id,
        },
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(messageSchema)
    .mutation(async ({ ctx, input }) => {
      // delete message here
      const message = await ctx.prisma.message.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!message) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Message with ID ${input.id} not found.`,
        });
      }

      if (message.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized.",
        });
      }

      return await ctx.prisma.message.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
