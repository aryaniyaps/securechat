import * as z from "zod";
import { env } from "~/env.mjs";

export function getAvatarUrl(image: string): string {
  if (z.string().url().safeParse(image).success) {
    // we have an avatar URL from an Oauth2 provider already
    return image;
  }
  return `http://${env.NEXT_PUBLIC_MINIO_ENDPOINT}/${env.NEXT_PUBLIC_MINIO_BUCKET}/${image}`;
}
