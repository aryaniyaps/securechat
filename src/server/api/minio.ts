import { Client } from "minio";
import { env } from "~/env.mjs";

// Configure MinIO client with your credentials
console.log(env.MINIO_USE_SSL);
export const minioClient = new Client({
  endPoint: env.MINIO_END_POINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
});
