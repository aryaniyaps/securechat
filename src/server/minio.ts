import { Client } from "minio";
import { env } from "~/env.mjs";

// Configure MinIO client with your credentials
export const minioClient = new Client({
  endPoint: env.MINIO_END_POINT,
  port: Number(env.MINIO_PORT),
  useSSL: env.MINIO_USE_SSL === "true",
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});
