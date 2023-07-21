import Pusher from "pusher-js";
import { env } from "~/env.mjs";

export const pusher = new Pusher(env.NEXT_PUBLIC_PUSHER_APP_KEY, {
  cluster: env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
  forceTLS: env.NEXT_PUBLIC_PUSHER_FORCE_TLS === "true",
  wsHost: env.NEXT_PUBLIC_PUSHER_WS_HOST,
  wsPort: Number(env.NEXT_PUBLIC_PUSHER_WS_PORT),
  disableStats: true,
  enabledTransports: ["ws", "wss"],
});

// Pusher.log = function (message) {
//   console.log(message);
// };
