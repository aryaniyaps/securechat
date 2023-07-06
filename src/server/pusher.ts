import Pusher from "pusher";
import { env } from "~/env.mjs";

export const pusher = Pusher.forURL(env.PUSHER_URL);
