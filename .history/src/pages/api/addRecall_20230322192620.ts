import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { client } from "lib/redis";
import { env } from "~/env.mjs";
import { z } from "zod";
import format from "date-fns/format";
import { prisma } from "~/server/db";


client.on("error", (err) => console.log("Redis Client Error", err));

// creating a schema for strings
const addRecallSchema: z.Schema = z.object({
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


  // Validating recall body with zod
  
const parsedRequestData: AddRecall = {
    name: 
}
  // Creating recall plan in DB
 const newRecall = await prisma.memoDate.create({
    data: {
      name: req.body.,
      userId: "1234",
      userEmail: "test@mail.com",
      userImage: "http://cdn.Image.com",
      userName: "Cmon",
      last: Date(),
      next: Date(),
      calendar: [Date(), Date()],
      
    },
  });

  
  // Connecting to redis client
  await client.connect();

  res.json({ msg: `Here's the data you saved ${newRecall}` });

  // Deconnecting from redis client
  await client.disconnect();
}
