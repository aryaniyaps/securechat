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
        await minioClient.makeBucket(env.MINIO_BUCKET_NAME, "us-east-1"); // Adjust region as needed
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
