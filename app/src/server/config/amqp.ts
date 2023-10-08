import { connect, type Channel } from "amqplib";
import { env } from "~/env.mjs";

let channel: Channel;

async function initRabbitMQ() {
  try {
    const connection = await connect(env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(env.RABBITMQ_QUEUE_NAME, { durable: false });
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
    throw error;
  }
}

export function getChannel() {
  if (!channel) {
    throw new Error("Channel is not initialized.");
  }
  return channel;
}

if (env.NODE_ENV !== "production") {
  // Call the initialization function during server startup.
  void initRabbitMQ();
}
