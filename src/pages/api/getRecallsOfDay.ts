import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { client } from "lib/redis";
import { env } from "~/env.mjs";
import { recallRepository } from "./test";
import { Where } from "redis-om";
import { addDays } from "date-fns";
import { AddRecall } from "./addRecall";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  // Rest of the API logic

  // Checking request method
  if (req.method !== "GET")
    return res.status(400).json({
      message: "Please be sure to fulfill the API request method requirements",
    });

  // Checking if authorization header is valid
  if (req.headers.authorization !== env.API_AUTH_HEADERS_KEY_GET_RECALLS_OF_DAY)
    return res
      .status(403)
      .json({ msg: "Your authorization header is not valid" });

  // Connecting to redis client
  await client.connect();

  // Setting up variables for date query
  const today = new Date()
  const tomorrow = addDays(new Date(), 1)
  const recall = await recallRepository
    .search()
    .where("nextRecall")
    .between(today, tomorrow)
    .return.all();

  console.log(recall);

  const recallObj = recall.map(item => {
    return {
      userName: item.userName,
      userId: item.userId,
      discordBotUrl: item.discordBotUrl,
      name: item.name,
    };
  })
  res.json({ msg: "Here are all the recalls of today", recallObj });


  // Deconnecting from redis client
  await client.disconnect();
}
