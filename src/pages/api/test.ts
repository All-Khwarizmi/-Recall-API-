import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { client } from "lib/redis";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { Schema, Repository } from "redis-om";
import { z } from "zod";
import addDays from "date-fns/addDays";

const recallSchema = new Schema("recall", {
  topicName: { type: "string" },
  userId: { type: "string" },
  userEmail: { type: "string" },
  userImage: { type: "string" },
  userName: { type: "string" },
  lastRecall: { type: "date" },
  nextRecall: { type: "date" },
  calendar: { type: "string[]" },
});

export const recallRepository = new Repository(recallSchema, client);

// creating a zod validation schema for recall incoming request
const addRecallSchema = z.object({
  topicName: z.string(),
  userId: z.string(),
  userEmail: z.string().email(),
  userImage: z.string(),
  userName: z.string(),
  lastRecall: z.date(),
  nextRecall: z.date(),
  calendar: z.array(z.string()),
});
export type AddRecall = z.infer<typeof addRecallSchema>;
export type DayDate = Date;

export default async function handler<NextApiHandler>(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Checking authorization headers
/*   if (req.headers.authorization !== env.API_AUTH_HEADERS_KEY_TEST)
    return res
      .status(403)
      .json({ msg: "Your authorization header is not valid" });
 */
  // Validating recall body with zod and typescript

/*   const requestData: AddRecall = {
    topicName: req.body.topicNname,
    userEmail: req.body.userEmail,
    userId: req.body.userId,
    userImage: req.body.userImage,
    userName: req.body.userName,
    lastRecall: new Date(),
    nextRecall: addDays(Date.parse(Date()), 1),
    calendar: req.body.calendar.map((item: string) => {
      console.log(item);
      console.log(Date.parse(item));
      return item;
    }),
  }; */
/* 
  const parsedRequestData = addRecallSchema.safeParse(requestData);
  if (!parsedRequestData.success)
    return res.status(400).json({
      msg: "Please be sure to fill the body of your request with valid data. Refer to API documentation.",
    });
  console.log("parsedRequestData", parsedRequestData);
 */
  // Creating recall plan in Redis DB
try {
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  await recallRepository.dropIndex()
/*   
  const recall = await recallRepository.save(parsedRequestData.data);
  // const requestKey = req.body;
  // const authHeaders = req.headers;
  console.log("parsedRequestData", parsedRequestData);
  console.log("recall", recall);
 */
  res.status(200).json({ name: `Setting key status = ` });
} catch (error) {
  console.log(error);
  res
    .status(500)
    .json({
      msg: "We could not add the new recall plan. Please try again later or open an issue on Github",
      error,
    });
}

  // Deconnecting from redis client
  await client.disconnect();
}