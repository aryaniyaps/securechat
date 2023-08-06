import { Centrifuge } from "centrifuge";
import WebSocket from "ws";
import { env } from "~/env.mjs";

export const centrifugeServer = new Centrifuge(env.CENTRIFUGO_URL, {
  websocket: WebSocket,
});
