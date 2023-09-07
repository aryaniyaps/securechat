import { env } from "~/env.mjs";

export function getMediaUrl(media: string): string {
  return `${env.NEXT_PUBLIC_S3_ENDPOINT}/${env.NEXT_PUBLIC_S3_MEDIA_BUCKET}/${media}`;
}
