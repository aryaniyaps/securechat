import PusherJS from "pusher-js";
import { env } from "~/env.mjs";

export const pusher = new PusherJS(env.PUSHER_APP_KEY, {
  wsHost: env.PUSHER_WS_HOST,
  wsPort: env.PUSHER_WS_PORT,
  forceTLS: env.PUSHER_FORCE_TLS,
  enabledTransports: ["ws", "wss"],
  cluster: env.PUSHER_APP_CLUSTER,
});
