import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { client } from "lib/redis";
import { env } from "~/env.mjs";
import { recallRepository } from "./test";
import { z } from "zod";

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

// Zod validation
const deleteRecallRequestSchema = z.object({
  userId: z.string(),
  topicName: z.string(),
  nextRecallName: z.string(),
  nextRecall: z.date(),
});
type DeleteRecall = z.infer<typeof deleteRecallRequestSchema>;

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
  if (req.headers.authorization !== env.API_AUTH_HEADERS_KEY_UPDATE_RECALL)
    return res
      .status(403)
      .json({ msg: "Your authorization header is not valid" });

  // Checking if request body is valid
  const requestData: DeleteRecall = { ...req.body };
  requestData.nextRecall = new Date(requestData.nextRecall);
  console.log("request Data", requestData);
  const parsedRequestData = deleteRecallRequestSchema.safeParse(requestData);
  console.log(parsedRequestData);
  if (!parsedRequestData.success) {
    return res.status(400).json({
      msg: "Please be sure to fill the body of your request with valid data. Refer to API documentation.",
    });
  }

  try {
    // Connecting to redis client
    client.on("error", (err) => console.log("Redis Client Error", err));
    await client.connect();

    // Looking for recallID
    const recall = await recallRepository
      .search()
      .where("userId")
      .eq(`${parsedRequestData.data.userId}`)
      .and("topicName")
      .eq(`${parsedRequestData.data.topicName}`)
      .return.firstId();
    if (!recall?.length) {
      // Deconnecting from redis client
      await client.disconnect();
      return res.json({ message: "No recall in database" });
    }

    // Fetching recall to update it
    const oldRecall = await recallRepository.fetch(recall);
    console.log("Old oldRecall", oldRecall);
    oldRecall.nextRecall = requestData.nextRecall;
    oldRecall.nextRecallName = requestData.nextRecallName;
    oldRecall.lastRecall = new Date()
    console.log("New oldRecall", oldRecall);
    // Saving recall plan to DB and since it already exist that updates it
    const recallUpdated = await recallRepository.save(oldRecall);

    res.json({
      msg: "The recall plan has been updated successfully",
      recallUpdated,
    });

    // Deconnecting from redis client
    await client.disconnect();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "We could not the delete recall plan. Please try again later or open an issue on Github",
      error,
    });
  }
}
