import jwt from "jsonwebtoken";
import { type NextApiRequest, type NextApiResponse } from "next";
import { z } from "zod";
import { env } from "~/env.mjs";
import { userSchema } from "~/schemas/user";
import { prisma } from "~/server/db";

const verifyTokenSchema = z.object({
  token: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { token } = verifyTokenSchema.parse(req.body);

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
