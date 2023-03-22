import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { client } from "lib/redis";

client.on("error", (err) => console.log("Redis Client Error", err));



export default async function handler<NextApiHandler>(
  req: NextApiRequest,
  res: NextApiResponse
) {

    const requestKey = req.body
    console.log(re)
    await client.connect();
 const key = await client.get("key");
  res.status(200).json(res.status(200).json({ name: `Getting ${key}` }));
}
