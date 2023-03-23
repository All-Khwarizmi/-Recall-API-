import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { client } from "lib/redis";
import { env } from "~/env.mjs";
import { recallRepository } from "./test";

client.on("error", (err) => console.log("Redis Client Error", err));

// Types
type MiddlewareFnCallbackFn = (result: unknown) => unknown;
type MiddlewareFn = (
  req: NextApiRequest,
  res: NextApiResponse,
  result: MiddlewareFnCallbackFn
) => void;
// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: MiddlewareFn
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: unknown) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

// TODO : Zod validation

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  // Rest of the API logic

  // TODO : change auth header
  if (req.headers.authorization !== env.API_AUTH_HEADERS_KEY_TEST)
    return res
      .status(403)
      .json({ msg: "Your authorization header is not valid" });
      
  // Connecting to redis client
  await client.connect();

  const recall = await recallRepository
    .search()
    .where("userId")
    .eq("req.body.userId")
    .return.all();

  res.json({ msg: "Hello there", recall });

  // Deconnecting from redis client
  await client.disconnect();
}
