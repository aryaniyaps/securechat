import { createTransport } from "nodemailer";
import { env } from "~/env.mjs";

export const transport = createTransport(env.EMAIL_SERVER, {
  from: env.EMAIL_FROM,
});
