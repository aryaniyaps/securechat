import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerAuthSession } from "~/server/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerAuthSession({ req, res });

  if (session) {
    res.json({ result: { user: session.user.id } });
  } else {
    res.json({
      disconnect: {
        code: 1000,
        reason: "unauthorized",
        reconnect: false,
      },
    });
  }
}
