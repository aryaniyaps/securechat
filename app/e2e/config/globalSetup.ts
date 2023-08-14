// inspired by https://github.com/GomaGoma676/e2e-nextjs-playwright/blob/main/e2e/config/globalSetup.ts
import { chromium } from "@playwright/test";
import { v4 } from "uuid";
import { prisma } from "~/server/db";

export default async function globalConfig() {
  const date = new Date();
  const sessionToken = v4();

  await prisma.user.upsert({
    where: {
      email: "peter@test.com",
    },
    create: {
      name: "Peter Parker",
      email: "peter@test.com",
      emailVerified: new Date(),
      sessions: {
        create: {
          expires: new Date(
            date.getFullYear(),
            date.getMonth() + 6,
            date.getDate()
          ),
          sessionToken,
        },
      },
      accounts: {
        create: {
          type: "email",
          provider: "email",
          providerAccountId: "peter@test.com",
        },
      },
    },
    update: {},
  });
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "next-auth.session-token",
      value: sessionToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      expires: Math.round((Date.now() + 86400000 * 1) / 1000),
    },
  ]);
  await context.storageState({});
  await browser.close();
}
