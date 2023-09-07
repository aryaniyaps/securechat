import * as z from "zod";
import { env } from "~/env.mjs";

export function getAvatarUrl(image: string | null, username: string): string {
  if (!image) {
    return `https://api.dicebear.com/6.x/identicon/svg?seed=${username}&scale=50`;
  }
  if (z.string().url().safeParse(image).success) {
    // we have an avatar URL from an Oauth2 provider already
    return image;
  }
  return `${env.NEXT_PUBLIC_S3_ENDPOINT}/${env.NEXT_PUBLIC_S3_AVATAR_BUCKET}/${image}`;
}
