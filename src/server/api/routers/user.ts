import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { minioClient } from "../minio";

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
      if (!(await minioClient.bucketExists(env.MINIO_BUCKET_NAME))) {
        try {
          console.log("making bucket...");
          await minioClient.makeBucket(env.MINIO_BUCKET_NAME);
          await minioClient.setBucketPolicy(
            env.MINIO_BUCKET_NAME,
            `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:GetBucketLocation",
        "s3:ListBucket"
      ],
      "Effect": "Allow",
      "Principal": {
        "AWS": [
          "*"
        ]
      },
      "Resource": [
        "arn:aws:s3:::${env.MINIO_BUCKET_NAME}"
      ],
      "Sid": ""
    },
    {
      "Action": [
        "s3:GetObject"
      ],
      "Effect": "Allow",
      "Principal": {
        "AWS": [
          "*"
        ]
      },
      "Resource": [
        "arn:aws:s3:::${env.MINIO_BUCKET_NAME}/*"
      ],
      "Sid": ""
    }
  ]
}`
          );
        } catch {
          await minioClient.removeBucket(env.MINIO_BUCKET_NAME);
        }
      }

      // Upload file
      await minioClient.putObject(env.MINIO_BUCKET_NAME, fileName, file);

      console.log(
        "PRESIGNED OBJECT: ",
        await minioClient.presignedGetObject(env.MINIO_BUCKET_NAME, fileName)
      );

      const url = await minioClient.presignedUrl(
        "GET",
        env.MINIO_BUCKET_NAME,
        fileName
      );
      // Return URL or ID for uploaded file
      console.log("PRE SIGNED URL: ", url);
      return url.replace(env.MINIO_END_POINT, "localhost");
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
      console.log("UPDATE MUTATION PASSED AVATAR URL: ", input.avatarUrl);
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
