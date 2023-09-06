import { S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env.mjs";

export const s3Client = new S3Client({
  region: env.S3_REGION,
  forcePathStyle: true,
  endpoint: env.S3_END_POINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
});
