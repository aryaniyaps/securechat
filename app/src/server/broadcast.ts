import { env } from "~/env.mjs";
import { getChannel } from "./config/amqp";

export function broadcastEvent<Payload>({
  event,
  payload,
  roomId,
}: {
  event: string;
  payload: Payload;
  roomId: string;
}) {
  const message = JSON.stringify({
    event,
    payload,
    roomId,
  });

  const channel = getChannel();

  channel.sendToQueue(env.RABBITMQ_QUEUE_NAME, Buffer.from(message));
}
