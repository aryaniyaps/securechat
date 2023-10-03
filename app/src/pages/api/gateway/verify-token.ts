import jwt from "jsonwebtoken";
import { type NextApiRequest, type NextApiResponse } from "next";
import { env } from "~/env.mjs";
import { userSchema } from "~/schemas/user";
import { prisma } from "~/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token not provided" });
  }

  try {
    const { sub } = jwt.verify(token, env.NEXTAUTH_SECRET);

    const user = await prisma.user.findUnique({ where: { id: String(sub) } });

    if (!user) {
      res.json({
        valid: false,
      });
    }

    res.json({
      valid: true,
      result: userSchema.parse(user),
    });
  } catch (error) {
    // Token verification failed
    res.json({
      valid: false,
    });
  }
}
