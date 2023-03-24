import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { client } from "lib/redis";

export default async function handler<NextApiHandler>(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const requestKey = req.body;
  console.log("reqkey", requestKey);
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  const key = await client.get(req.body.key);
  res.status(200).json({ name: `Here's your data ${key}` });
}
