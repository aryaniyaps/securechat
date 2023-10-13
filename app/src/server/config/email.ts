import Email from "email-templates";
import { createTransport } from "nodemailer";
import { env } from "~/env.mjs";
import { APP_DESCRIPTION, APP_NAME } from "~/utils/constants";

let email: Email;

export function getEmail(): Email {
  if (!email) {
    const transport = createTransport(env.EMAIL_SERVER, {
      from: env.EMAIL_FROM,
    });
    email = new Email({
      transport,
      send: true,
      preview: env.NODE_ENV !== "production",
      subjectPrefix: env.NODE_ENV === "production" ? false : "[DEV] ",
      views: {
        locals: {
          appName: APP_NAME,
          appDescription: APP_DESCRIPTION,
          appUrl: env.NEXTAUTH_URL,
        },
      },
    });
  }

  return email;
}
