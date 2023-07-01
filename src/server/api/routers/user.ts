import {
  CreateBucketCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { s3Client } from "../s3";

export const userRouter = createTRPCRouter({
  uploadAvatar: protectedProcedure
    .input(
      z.object({
        avatar: z.string(), // Base64 encoded image
      })
    )
    .output(z.string())
    .mutation(async ({ ctx, input }) => {
      // Convert base64 string to buffer
      const file = Buffer.from(input.avatar, "base64");

      const fileName = `avatar-${ctx.session.user.id}`;

      // Ensure bucket exists
      try {
        await s3Client.send(
          new CreateBucketCommand({ Bucket: env.AWS_S3_BUCKET_NAME })
        );
      } catch (error) {
        console.error("Error creating bucket:", error);
        throw new Error("Failed to create bucket");
      }

      // Upload file
      await s3Client.send(
        new PutObjectCommand({
          Bucket: env.AWS_S3_BUCKET_NAME,
          Key: fileName,
          Body: file,
        })
      );

      const url = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: env.AWS_S3_BUCKET_NAME,
          Key: fileName,
        })
      );
      // Return URL or ID for uploaded file
      console.log("SIGNED URL: ", url);
      return url;
    }),
  update: protectedProcedure
    .input(
      z.object({
        name: z.optional(z.string()),
        username: z.optional(z.string()),
        avatarUrl: z.optional(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        data: {
          ...(input.username && {
            username: input.username,
          }),
          ...(input.name && {
            name: input.name,
          }),
          ...(input.avatarUrl && {
            image: input.avatarUrl,
          }),
        },
        where: { id: ctx.session.user.id },
      });
    }),
});
