import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  owner: z.object({
    name: z.string().nullish(),
    username: z.string(),
    image: z.string(),
  }),
});

export const roomRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
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

      return room;
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .output(
      z.object({
        items: z.array(roomSchema),
        nextCursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.prisma.room.findMany({
        take: input.limit + 1, // get an extra item at the end which we'll use as next cursor
        ...(input.cursor && {
          cursor: { id: input.cursor },
        }),
        orderBy: {
          createdAt: "desc",
        },
        include: {
          owner: {
            select: {
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        if (nextItem) {
          nextCursor = nextItem.id;
        }
      }
      return {
        items,
        nextCursor,
      };
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
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

      await ctx.prisma.room.delete({
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
        include: {
          owner: {
            select: {
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });
    }),
});
