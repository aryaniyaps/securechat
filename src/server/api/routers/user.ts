import { TRPCError } from "@trpc/server";
import fs from "fs";
import { nanoid } from "nanoid";
import path from "path";
import { z } from "zod";
import { env } from "~/env.mjs";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { transport } from "~/server/email";
import { minioClient } from "../../minio";

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
      if (input.username) {
        const existingUser = await ctx.prisma.user.findUnique({
          where: { username: input.username },
        });
        if (existingUser) {
          throw new TRPCError({
            message: "Username is already taken.",
            code: "CONFLICT",
          });
        }
      }
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
  requestEmailChange: protectedProcedure
    .input(z.object({ newEmail: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: input.newEmail },
      });
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Requested email is already in use.",
        });
      }

      const changeToken = nanoid(18);
      const changeUrl = new URL("/auth/email/change", env.NEXT_PUBLIC_SITE_URL);
      changeUrl.searchParams.append("changeToken", changeToken);
      changeUrl.searchParams.append("newEmail", input.newEmail);
      await transport.sendMail({
        to: input.newEmail,
        subject: "Email Change Request",
        text: `To confirm your email change, please visit the following link: ${changeUrl.toString()}`,
        html: `To confirm your email change, please <a href="${changeUrl.toString()}">click here</a>.`,
      });
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          emailChange: input.newEmail,
          emailChangeToken: changeToken,
          emailChangeSentAt: new Date(),
        },
      });
    }),
  changeEmail: protectedProcedure
    .input(z.object({ changeToken: z.string(), newEmail: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findFirst({
        where: {
          emailChange: input.newEmail,
          emailChangeToken: input.changeToken,
        },
      });
      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not change email. Please try again later.",
        });
      }
      // update user email
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          email: input.newEmail,
          emailChange: null,
          emailChangeToken: null,
          emailChangeSentAt: null,
        },
      });
      // TODO: update Oauth providers here?
    }),
});
