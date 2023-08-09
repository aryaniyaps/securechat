import Email from "email-templates";
import { createTransport } from "nodemailer";
import path from "path";
import { env } from "~/env.mjs";
import { APP_DESCRIPTION, APP_NAME } from "~/utils/constants";

const transport = createTransport(env.EMAIL_SERVER, {
  from: env.EMAIL_FROM,
});

export const email = new Email({
  message: {
    from: env.EMAIL_FROM,
  },

  transport,
  views: {
    root: path.resolve(__dirname, "..", "emails"),
    locals: {
      appName: APP_NAME,
      appDescription: APP_DESCRIPTION,
      appUrl: env.NEXTAUTH_URL,
    },
  },
});
