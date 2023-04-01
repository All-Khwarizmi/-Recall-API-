import { NextApiRequest, NextApiResponse } from "next";
import { client } from "lib/redis";
import { env } from "~/env.mjs";
import { Schema, Repository } from "redis-om";
import { z } from "zod";
import Cors from "cors";

// Creating Redis schema
export const recallSchema = new Schema("recall", {
  topicName: { type: "string" },
  questionName: { type: "string" },
  interval: { type: "number" },
  repetitions: { type: "number" },
  easeFactor: { type: "number" },
  quality: { type: "number" },
  score: { type: "string[]" },
  studySessions: { type: "string[]" },
  userId: { type: "string" },
  userEmail: { type: "string" },
  userImage: { type: "string" },
  userName: { type: "string" },
  lastRecall: { type: "date" },
  nextRecall: { type: "date" },
  nextRecallName: { type: "string" },
  calendar: { type: "string[]" },
  botUrl: { type: "string" },
});

export const recallRepository = new Repository(recallSchema, client);

// creating a zod validation schema for recall incoming request
const addRecallSchema = z.object({
  topicName: z.string(),
  questionName: z.string(),
  interval: z.number(),
  repetitions: z.number(),
  easeFactor: z.number(),
  quality: z.number(),
  score: z.array(z.number()),
  studySessions: z.array(z.string()),
  userId: z.string(),
  userEmail: z.string().email(),
  userImage: z.string(),
  userName: z.string(),
  lastRecall: z.date(),
  nextRecall: z.date(),
  nextRecallName: z.string(),
  calendar: z.object({
    recallOne: z.string(),
    recallTwo: z.string(),
    recallThree: z.string(),
    recallFour: z.string(),
    recallFive: z.string(),
    recallSix: z.string(),
    recallSeven: z.string(),
    recallEight: z.string(),
    recallNine: z.string(),
    recallTen: z.string(),
  }),
  botUrl: z.string(),
});

// Infering typescript type from zod schema
export type AddRecall = z.infer<typeof addRecallSchema>;
export type DayDate = Date;
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

export default async function handler<NextApiHandler>(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Run the middleware
  await runMiddleware(req, res, cors);

  // Checking request method
  if (req.method !== "POST")
    return res.status(400).json({
      message: "Please be sure to fulfill the API request method requirements",
    });

  // Checking authorization headers
  if (req.headers.authorization !== env.API_AUTH_HEADERS_KEY_ADD_RECALL)
    return res
      .status(403)
      .json({ msg: "Your authorization header is not valid" });

  // Validating recall body with zod and typescript

  const requestData: AddRecall = {
    topicName: req.body.topicName,
    questionName: req.body.questionName,
    interval: req.body.interval,
    repetitions: req.body.repetitions,
    easeFactor: req.body.easeFactor,
    quality: req.body.quality,
    score: req.body.score,
    studySessions: req.body.studySessions,
    userEmail: req.body.userEmail,
    userId: req.body.userId,
    userImage: req.body.userImage,
    userName: req.body.userName,
    botUrl: req.body.botUrl,
    lastRecall: new Date(req.body.lastRecall),
    nextRecall: new Date(req.body.nextRecall),
    nextRecallName: req.body.nextRecallName,
    calendar: req.body.calendar,
  };
  // console.log(requestData);
  console.log("Req vody", req.body);
  console.log("requestData", requestData);
  const parsedRequestData = addRecallSchema.safeParse(requestData);
  const parsedRequestDatParse = addRecallSchema.parse(requestData);
  console.log("parsedRequestData", parsedRequestDatParse);
  if (!parsedRequestData.success)
    return res.status(400).json({
      msg: "Please be sure to fill the body of your request with valid data. Refer to API documentation.",
    });

  console.log();
  // Creating recall plan in Redis DB
  try {
    client.on("error", (err) => console.log("Redis Client Error", err));
    const info = await client.clientInfo().catch((error) => {
      console.log(error.message);
      return error.message;
    });
    console.log("info", info);
    if (info === "The client is closed") {
      await client.connect().catch((error) => console.log(error.message));
      // Creating recall plan in Redis DB
    }

    // Checking in recall plan is already in DB
    const isRecallInDB = await recallRepository
      .search()
      .where("userId")
      .eq(`${parsedRequestData.data.userId}`)
      .and("topicName")
      .eq(`${parsedRequestData.data.topicName}`)
      .and("questionName")
      .eq(`${parsedRequestData.data.questionName}`)
      .return.return.all();
    if (isRecallInDB.length) {
      // Deconnecting from redis client
      await client.disconnect();
      console.log(isRecallInDB.length);
      console.log("Recall already in DB");
      return res.status(208).json({ message: "Recall already in database" });
    }

    // Creating recall plan in Redis DB
    await recallRepository.createIndex();

    const recall = await recallRepository.save(parsedRequestData.data);
    console.log("recall", recall);

    res.status(200).json({
      name: `Added successfully recall plan = ${JSON.stringify(recall)}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "We could not add the new recall plan. Please try again later or open an issue on Github",
      error,
    });
  }

  // Deconnecting from redis client
  await client.disconnect();
}
