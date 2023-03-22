import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { client } from "lib/redis";
import { env } from "~/env.mjs";
import { z } from "zod";
import format from "date-fns/format";
import getDate from "date-fns/getDate";
import { prisma } from "~/server/db";
import { addDays } from "date-fns";


client.on("error", (err) => console.log("Redis Client Error", err));

// creating a schema for strings
const addRecallSchema = z.object({
  name: z.string(),
  userId: z.string(),
  userEmail: z.string().email(),
  userImage: z.string(),
  userName: z.string(),
  last: z.date(),
  next: z.date(),
  calendar: z.array(z.date()),
});
export type AddRecall = z.infer<typeof addRecallSchema >
export type DayDate = Date
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

  
  if (req.headers.authorization !== env.API_AUTH_HEADERS_KEY_ADD_RECALL)
    return res
      .status(403)
      .json({ msg: "Your authorization header is not valid" });


  // Validating recall body with zod and typescript
  const date = new Date()
const requestData: AddRecall = {
  name: req.body.name,
  userEmail: req.body.userEmail,
  userId: req.body.userId,
  userImage: req.body.userImage,
  userName: req.body.userName,
  last: new Date(Date.parse),
  next: addDays(Date.parse(Date()), 1),
  calendar: req.body.calendar.map((item: DayDate) => {
   console.log(getDate(new Date(item)));
     return getDate(new Date(item));
  }),
};

const parsedRequestData = addRecallSchema.parse(requestData)

console.log("parsedRequestData", parsedRequestData);

  // Creating recall plan in DB
 const newRecall = await prisma.memoDate.create({
    data: requestData,
  });

  
  // Connecting to redis client
  await client.connect();

  res.json({ msg: `Here's the data you saved ${newRecall}` });

  // Deconnecting from redis client
  await client.disconnect();
}
