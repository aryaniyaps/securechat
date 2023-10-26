import { DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { env } from "~/env.mjs";
import { attachmentFileSchema } from "~/schemas/attachment";
import { messageCreateSchema, messageSchema } from "~/schemas/message";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { broadcastEvent } from "~/server/broadcast";
import { s3Client } from "~/server/config/s3";
import {
  DEFAULT_PAGINATION_LIMIT,
  MAX_MESSAGE_ATTACHMENTS,
} from "~/utils/constants";

export const messageRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(100).default(DEFAULT_PAGINATION_LIMIT),
      })
    )
    .output(
      z.object({
        items: z.array(messageSchema),
        nextCursor: z.string().optional(),
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
  createAttachmentPresignedUrls: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        attachments: z
          .array(
            z.object({
              id: z.string(),
              contentType: z.string(),
              name: z.string(),
            })
          )
          .max(MAX_MESSAGE_ATTACHMENTS),
      })
    )
    .output(
      z.array(
        z.object({
          id: z.string(),
          presignedUrl: z.string(),
          metadata: z.object({
            uri: z.string(),
            name: z.string(),
            contentType: z.string(),
          }),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const metadataPromises = input.attachments.map((attachment) => {
        const uri = `${input.roomId}/${ctx.session.user.id}/${nanoid(6)}`;
        const command = new PutObjectCommand({
          Bucket: env.S3_MEDIA_BUCKET_NAME,
          Key: uri,
          ContentType: attachment.contentType,
          Metadata: {
            name: attachment.name,
          },
        });

        return getSignedUrl(s3Client, command, {
          expiresIn: 3600, // 1 hr
        }).then((presignedUrl) => ({
          presignedUrl,
          id: attachment.id,
          metadata: {
            uri,
            name: attachment.name,
            contentType: attachment.contentType,
          },
        }));
      });

      const metadata = await Promise.all(metadataPromises);

      return metadata;
    }),
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().nullable(),
        attachments: z.array(attachmentFileSchema).max(MAX_MESSAGE_ATTACHMENTS),
        roomId: z.string(),
        nonce: z.string().nullable(),
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

      broadcastEvent({
        event: "create_message",
        payload: messageCreateSchema.parse({ ...message, nonce: input.nonce }),
        roomId: input.roomId,
      });

      return message;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.optional(z.string()),
        attachments: z.optional(
          z.array(attachmentFileSchema).max(MAX_MESSAGE_ATTACHMENTS)
        ),
      })
    )
    .output(messageSchema)
    .mutation(async ({ ctx, input }) => {
      const existingMessage = await ctx.prisma.message.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!existingMessage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Message with ID ${input.id} not found.`,
        });
      }

      if (existingMessage.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: `Cannot update message with ID ${input.id}.`,
        });
      }

      const message = await ctx.prisma.message.update({
        data: {
          ...(input.content && {
            content: input.content,
          }),
          ...(input.attachments && {
            attachments: input.attachments,
          }),
          ...((input.content || input.attachments) && {
            isEdited: true,
          }),
        },
        where: { id: existingMessage.id },
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

      broadcastEvent({
        event: "update_message",
        payload: messageSchema.parse(message),
        roomId: message.roomId,
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

      broadcastEvent({
        event: "delete_message",
        payload: messageSchema.parse(message),
        roomId: message.roomId,
      });
    }),
});
