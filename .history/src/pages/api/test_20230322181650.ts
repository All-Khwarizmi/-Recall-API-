import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ name: "John Doe" });
}
