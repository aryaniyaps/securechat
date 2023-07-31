import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { roomSchema } from "~/schemas/room";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const roomRouter = createTRPCRouter({
  getById: publicProcedure
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
        search: z.optional(z.string()),
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
        ...(input.search && {
          where: {
            name: { search: input.search.trim().split(" ").join(" & ") },
          },
        }),
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
