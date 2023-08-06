import { Centrifuge } from "centrifuge";
import WebSocket from "ws";
import { env } from "~/env.mjs";

export const centrifuge = new Centrifuge(env.NEXT_PUBLIC_CENTRIFUGO_URL, {
  websocket: WebSocket,
});
