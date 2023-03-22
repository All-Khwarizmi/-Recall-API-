import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { client } from "lib/redis";

client.on("error", (err) => console.log("Redis Client Error", err));




export default async function handler<NextApiHandler>(req: NextApiRequest, res: NextApiResponse) {
await client.connect();
 const requestKey = req.body;
 console.log("reqkey", requestKey);
 const setKey =  await client.set(req.body.key, req.body.value);

  res.status(200).json({ name: `Setting ${setKey}` });
  await client.disconnect();
}
