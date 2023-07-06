import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { pusher } from "~/server/pusher";

const messageSchema = z.object({
  id: z.string(),
  content: z.string(),
  roomId: z.string(),
  ownerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  owner: z.object({
    name: z.string().nullish(),
    username: z.string(),
    image: z.string(),
  }),
});

export const messageRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .output(
      z.object({
        items: z.array(messageSchema),
        nextCursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const items = await ctx.prisma.message.findMany({
        where: { roomId: input.roomId },
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
      // check if room ID is valid here
      const message = await ctx.prisma.message.create({
        data: {
          content: input.content,
          roomId: input.roomId,
          ownerId: ctx.session.user.id,
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
      // broadcast message here
      await pusher.trigger(`room-${input.roomId}`, "message:create", message);
      console.log("MESSAGE TRIGGER PULLED");
      return message;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
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

      await ctx.prisma.message.delete({
        where: {
          id: input.id,
        },
      });
      // broadcast message here
      await pusher.trigger(`room-${message.roomId}`, "message:delete", message);
    }),
});
