import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { client } from "lib/redis";


export default function handler<NextApiHandler>(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ name: "John Doe" });
}
