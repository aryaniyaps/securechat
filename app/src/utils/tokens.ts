import jwt from "jsonwebtoken";
import { env } from "~/env.mjs";

export function generateGatewayToken({ userId }: { userId: string }) {
  const payload = {
    sub: userId,
    type: "gatewayToken",
  };

  return jwt.sign(payload, env.NEXTAUTH_SECRET, { expiresIn: "1h" });
}
