import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { client } from "lib/redis";

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();

export default async function handler<NextApiHandler>(
  req: NextApiRequest,
  res: NextApiResponse
) {
 const key = await client.get("key");
  res.status(200).json({ name: "John Doe" });
}
