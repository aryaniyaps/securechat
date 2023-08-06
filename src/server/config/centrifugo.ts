import { Centrifuge } from "centrifuge";
import WebSocket from "ws";

export const centrifuge = new Centrifuge(
  "ws://centrifugo:8000/connection/websocket",
  { websocket: WebSocket }
);
