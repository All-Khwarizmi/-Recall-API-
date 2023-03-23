import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { client } from "lib/redis";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { Schema, Repository } from "redis-om";
import { z } from "zod";
import addDays from "date-fns/addDays";
import { requestMethodChecker } from "lib/requestMethodChecker";

client.on("error", (err) => console.log("Redis Client Error", err));

export const recallSchema = new Schema("recall", {
  name: { type: "string" },
  userId: { type: "string" },
  userEmail: { type: "string" },
  userImage: { type: "string" },
  userName: { type: "string" },
  lastRecall: { type: "date" },
  nextRecall: { type: "date" },
  calendar: { type: "string[]" },
  discordBotUrl: { type: "string" },
});

export const recallRepository = new Repository(recallSchema, client);

// creating a zod validation schema for recall incoming request
const addRecallSchema = z.object({
  name: z.string(),
  userId: z.string(),
  userEmail: z.string().email(),
  userImage: z.string(),
  userName: z.string(),
  lastRecall: z.date(),
  nextRecall: z.date(),
  calendar: z.array(z.string()),
  discordBotUrl: z.string(),
});
export type AddRecall = z.infer<typeof addRecallSchema>;
export type DayDate = Date;

export default async function handler<NextApiHandler>(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
    name: req.body.name,
    userEmail: req.body.userEmail,
    userId: req.body.userId,
    userImage: req.body.userImage,
    userName: req.body.userName,
    discordBotUrl: req.body.discordBotUrl,
    lastRecall: new Date(),
    nextRecall: addDays(Date.parse(Date()), 1),
    calendar: req.body.calendar.map((item: string) => {
      /*  console.log(item);
      console.log(Date.parse(item)); */
      return item;
    }),
  };

  const parsedRequestData = addRecallSchema.safeParse(requestData);
  if (!parsedRequestData.success)
    return res.status(400).json({
      msg: "Please be sure to fill the body of your request with valid data. Refer to API documentation.",
    });

  // Creating recall plan in Redis DB
  try {
    await client.connect();

    // Checking in recall plan is already in DB
    const isRecallInDB = await recallRepository
      .search()
      .where("userId")
      .eq(`${parsedRequestData.data.userId}`)
      .and("name")
      .eq(`${parsedRequestData.data.name}`)
      .return.return.all();
    if (isRecallInDB.length) {
      // Deconnecting from redis client
      await client.disconnect();
      console.log(isRecallInDB.length);
      return res.json({ message: "Recall already in database" });
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
