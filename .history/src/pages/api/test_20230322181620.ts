import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res) {
  res.status(200).json({ name: "John Doe" });
}
