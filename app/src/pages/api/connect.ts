import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerAuthSession } from "~/server/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerAuthSession({ req, res });

  if (session) {
    res.json({
      valid: true,
      result: {
        id: session.user.id,
        image: session.user.image,
        name: session.user.name,
        username: session.user.username,
        createdAt: session.user.createdAt,
      },
    });
  } else {
    res.json({
      valid: false,
    });
  }
}
