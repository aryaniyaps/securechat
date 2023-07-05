import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const roomRouter = createTRPCRouter({
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(roomSchema)
    .mutation(async ({ ctx, input }) => {
      // delete room here
      const room = await ctx.prisma.room.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Room with ID ${input.id} not found.`,
        });
      }

      if (room.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized.",
        });
      }

      return await ctx.prisma.room.delete({
        where: {
          id: input.id,
        },
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .output(roomSchema)
    .mutation(async ({ ctx, input }) => {
      // create room here
      return await ctx.prisma.room.create({
        data: { name: input.name, ownerId: ctx.session.user.id },
      });
    }),
});
