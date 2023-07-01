import { S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env.mjs";

// Configure the S3 client
export const s3Client = new S3Client({
  region: env.AWS_S3_REGION,
  endpoint: env.AWS_S3_END_POINT,
  credentials: {
    accessKeyId: env.AWS_S3_ACCESS_KEY,
    secretAccessKey: env.AWS_S3_SECRET_KEY,
  },
  forcePathStyle: true,
});
