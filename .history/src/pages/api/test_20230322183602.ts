import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { client } from "lib/redis";

client.on("error", (err) => console.log("Redis Client Error", err));




export default async function handler<NextApiHandler>(req: NextApiRequest, res: NextApiResponse) {

// Checking authorization headers
if (req.headers.X)

  // Connecting to redis client
  await client.connect();
  const requestKey = req.body;
  const authHeaders = req.headers;
  console.log("reqkey", requestKey);
  console.log("authHeaders", authHeaders);
  const setKey = await client.set(req.body.key, req.body.value);

  res.status(200).json({ name: `Setting key status = ${setKey}` });

  // Deconnecting from redis client
  await client.disconnect();
}
