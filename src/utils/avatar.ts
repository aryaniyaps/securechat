import { env } from "~/env.mjs";

export function getAvatarUrl(fileName: string): string {
  return `http://${env.NEXT_PUBLIC_MINIO_ENDPOINT}/${env.NEXT_PUBLIC_MINIO_BUCKET}/${fileName}`;
}
