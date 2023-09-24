import { DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { env } from "~/env.mjs";
import { messageSchema } from "~/schemas/message";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { s3Client } from "~/server/config/s3";
import { wsServerApi } from "~/server/config/wsServer";
import {
  DEFAULT_PAGINATION_LIMIT,
  MAX_MESSAGE_ATTACHMENTS,
} from "~/utils/constants";

export const messageRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100).default(DEFAULT_PAGINATION_LIMIT),
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
  createMediaPresignedUrl: protectedProcedure
    .input(z.object({ contentType: z.string(), roomId: z.string() }))
    .output(z.object({ presignedUrl: z.string(), uri: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const uri = `${input.roomId}/${ctx.session.user.id}/${nanoid(6)}`;
      const command = new PutObjectCommand({
        Bucket: env.S3_MEDIA_BUCKET_NAME,
        Key: uri,
        ContentType: input.contentType,
      });
      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600, // 1 hr
      });

      return { presignedUrl, uri };
    }),
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().nullable(),
        attachments: z
          .array(
            z.object({
              name: z.string(),
              contentType: z.string(),
              uri: z.string(),
            })
          )
          .max(MAX_MESSAGE_ATTACHMENTS),
        roomId: z.string(),
      })
    )
    .output(messageSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.content && input.attachments.length === 0) {
        throw new TRPCError({
          message: "Either content or attachments must be provided.",
          code: "BAD_REQUEST",
        });
      }
      // check if room ID is valid here
      const message = await ctx.prisma.message.create({
        data: {
          content: input.content,
          roomId: input.roomId,
          attachments: input.attachments,
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

      await wsServerApi.post("/broadcast-event", {
        type: "CREATE_MESSAGE",
        payload: messageSchema.parse(message),
        roomId: input.roomId,
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

      // delete attachments here
      // we have a problem connecting to the s3 gateway in the development environment alone
      try {
        await s3Client.send(
          new DeleteObjectsCommand({
            Bucket: env.S3_MEDIA_BUCKET_NAME,
            Delete: {
              Objects: message.attachments.map((attachment) => {
                return { Key: attachment.uri };
              }),
              Quiet: false,
            },
          })
        );
      } catch (err) {
        console.error(err);
      }

      // broadcast message here
      await wsServerApi.post("/broadcast-event", {
        type: "DELETE_MESSAGE",
        payload: messageSchema.parse(message),
        roomId: message.roomId,
      });
    }),
});
