import fs from "fs";
import { nanoid } from "nanoid";
import path from "path";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { minioClient } from "../minio";

export const userRouter = createTRPCRouter({
  uploadAvatar: protectedProcedure
    .input(
      z.object({
        avatar: z.string(), // Base64 encoded image
        fileType: z.string(), // File type
      })
    )
    .output(z.string())
    .mutation(async ({ ctx, input }) => {
      // Convert base64 string to buffer
      const file = Buffer.from(input.avatar, "base64");

      // Determine file extension
      const extension = input.fileType.split("/")[1] || "jpg"; // defaults to jpg;

      const fileName = `${ctx.session.user.id}/avatar-${nanoid(
        6
      )}.${extension}`;

      // Ensure bucket exists
      if (!(await minioClient.bucketExists(env.MINIO_BUCKET_NAME))) {
        try {
          console.log("making bucket...");
          await minioClient.makeBucket(env.MINIO_BUCKET_NAME);
          //allow everyone to GET from bucket
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
          // add default avatar
          const filePath = path.join(process.cwd(), "assets", "avatar.jpg");
          const fileData = fs.readFileSync(filePath);
          await minioClient.putObject(
            env.MINIO_BUCKET_NAME,
            "avatar.jpg",
            fileData
          );
        } catch {
          await minioClient.removeBucket(env.MINIO_BUCKET_NAME);
        }
      }

      // Upload file
      await minioClient.putObject(env.MINIO_BUCKET_NAME, fileName, file, {
        "Content-Type": input.fileType,
      });
      return fileName;
    }),
  update: protectedProcedure
    .input(
      z.object({
        name: z.optional(z.string()),
        username: z.optional(z.string()),
        image: z.optional(z.string()),
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
          ...(input.image && {
            image: input.image,
          }),
        },
        where: { id: ctx.session.user.id },
      });
    }),
});
