import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { messageSchema } from "~/schemas/message";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { centrifugeApi } from "~/server/config/centrifugo";
import { wsServerApi } from "~/server/config/wsServer";

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
              createdAt: true,
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
              createdAt: true,
            },
          },
        },
      });
      // broadcast message here
      await wsServerApi.post("/broadcast-event", {
        type: "CREATE_MESSAGE",
        payload: message,
        roomId: input.roomId,
      });
      await centrifugeApi.post("/publish", {
        channel: `rooms:${input.roomId}`,
        data: {
          type: "message:create",
          payload: message,
        },
      });

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
      await wsServerApi.post("/broadcast-event", {
        type: "DELETE_MESSAGE",
        payload: message,
        roomId: message.roomId,
      });
      await centrifugeApi.post("/publish", {
        channel: `rooms:${message.roomId}`,
        data: {
          type: "message:delete",
          payload: message,
        },
      });
    }),
});
