import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { client } from "lib/redis";
import { env } from "~/env.mjs";
import { recallRepository } from "./addRecall";
import { z } from "zod";

// Connecting to redis client
client.on("error", (err) => console.log("Redis Client Error", err));
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
// Zod validation
const userRecallRequestSchema = z.object({
  userId: z.string(),
  topicName: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  // Rest of the API logic

  // Checking request method
  if (req.method !== "POST")
    return res.status(400).json({
      message: "Please be sure to fulfill the API request method requirements",
    });

  // Checking if authorization header is valid
  if (
    req.headers.authorization !== env.API_AUTH_HEADERS_KEY_GET_USER_TOPIC_RECALL
  )
    return res
      .status(403)
      .json({ msg: "Your authorization header is not valid" });

  // Checking if request body is valid
  const parsedRequestData = userRecallRequestSchema.safeParse(req.body);
  if (!parsedRequestData.success)
    return res.status(400).json({
      msg: "Please be sure to fill the body of your request with valid data. Refer to API documentation.",
    });

  try {
    const info = await client.clientInfo().catch((error) => {
      console.log(error.message);
      return error.message;
    });
    console.log("info", info);
    if (info === "The client is closed") {
      await client.connect().catch((error) => console.log(error.message));
      // Creating recall plan in Redis DB
    }

    // Looking for recall plan
    const recall = await recallRepository
      .search()
      .where("userId")
      .eq(`${parsedRequestData.data.userId}`)
      .and("topicName")
      .eq(`${parsedRequestData.data.topicName}`)

      .return.all();
    if (!recall) {
      // Deconnecting from redis client

      console.log(recall);
      return res.json({ message: "No recall in database" });
    }

    // Deconnecting from redis client

    res.json({ msg: "Here are your user recall plan", recall });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "We could not the user recall plans recall plan. Please try again later or open an issue on Github",
      error,
    });
  }
}
