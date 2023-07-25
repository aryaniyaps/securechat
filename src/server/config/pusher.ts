import Pusher from "pusher";
import { env } from "~/env.mjs";

export const pusher = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_APP_KEY,
  secret: env.PUSHER_SECRET,
  host: env.PUSHER_HOST,
  port: env.PUSHER_PORT,
  cluster: env.PUSHER_CLUSTER,
  useTLS: env.PUSHER_USE_TLS === "true",
});
