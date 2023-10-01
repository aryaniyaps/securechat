// import { type NextApiRequest, type NextApiResponse } from "next";
// import { getServerAuthSession } from "~/server/auth";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const session = await getServerAuthSession({ req, res });

//   if (session) {
//     res.json({
//       valid: true,
//       result: {
//         id: session.user.id,
//         image: session.user.image,
//         name: session.user.name,
//         username: session.user.username,
//         createdAt: session.user.createdAt,
//       },
//     });
//   } else {
//     res.json({
//       valid: false,
//     });
//   }
// }

import jwt from "jsonwebtoken";
import { type NextApiRequest, type NextApiResponse } from "next";
import { env } from "~/env.mjs";
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
      result: user,
    });
  } catch (error) {
    // Token verification failed
    res.json({
      valid: false,
    });
  }
}
