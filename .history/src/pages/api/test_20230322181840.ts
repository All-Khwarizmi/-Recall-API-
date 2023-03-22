import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { client } from "lib/redis";

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();


export default function handler<NextApiHandler>(req: NextApiRequest, res: NextApiResponse) {

    await client.set("key", "value");
  res.status(200).json({ name: "John Doe" });
}
