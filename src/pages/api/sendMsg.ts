import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { client } from "lib/redis";
import { env } from "~/env.mjs";
import { recallRepository } from "./test";
import { z } from "zod";
const sgMail = require("@sendgrid/mail");
import { htmlEmail } from "lib/emailHtml";

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

const recallsOfTodaySchema = z.object({
  msg: z.string(),
  recallObj: z.array(
    z.object({
      userName: z.string(),
      userId: z.string(),
      discordBotUrl: z.string(),
      name: z.string(),
    })
  ),
});
type RecallOfToday = z.infer<typeof recallsOfTodaySchema>;
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
  if (req.headers.authorization !== env.API_AUTH_HEADERS_SEND_MSG)
    return res
      .status(403)
      .json({ msg: "Your authorization header is not valid" });

  try {
    // Fetch get recall of today endpoint
    const optionsRecallOfToday = {
      method: "GET",
      headers: {
        Authorization: env.API_AUTH_HEADERS_KEY_GET_RECALLS_OF_DAY,
      },
    };
    const responseRecallOfToday = await fetch(
      "http://localhost:3000/api/getRecallsOfDay",
      optionsRecallOfToday
    );
    const recallsOfToday: RecallOfToday = await responseRecallOfToday.json();

    // Validating incoming data from recalls of today service
    const parsedRecallsOfToday = recallsOfTodaySchema.safeParse(recallsOfToday);
    console.log("In sendMsg", parsedRecallsOfToday);

    // Mapping over recalls of the day if any
    if (parsedRecallsOfToday.success && parsedRecallsOfToday.data.recallObj.length) {
      parsedRecallsOfToday.data.recallObj.map(async (recall) => {
         const message = `
    Today you should study the following topic :
    ${recall.name}
    
  `;
        const options = {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: message }),
        };
        const response = await fetch(recall.discordBotUrl, options);
        console.log(response.status)
      });
    }
    /*   const message = `
    You should study the following topics :
    ${memoOfTheDay.map((item) => "-" + item.name + "\n").join(" ")}
  `;
      const axiosConfig = {
    method: "POST",
    url: env.NEXT_PUBLIC_DISCORD_WEBHOOK_URI,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      content: message,
    }),
  };

  axios(axiosConfig)
    .then(function (response) {
      console.log(response.status);
    })
    .catch(function (error) {
      console.log(error);
    })
    .finally(function () {
      // always executed
    }); */

    /*   // Sending email
  (async () => {
  try {
    await sgMail.send(msg);
  } catch (error: any) {
    console.error(error);
     if (error.response) {
       console.error(error.response.body);
     }
  }
})() 
    const options = {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    };
    const response = await fetch("", options);

    console.log(response.ok);
    console.log(response.body);
    console.log(req.body);
    // console.log(req.headers)*/

    res.json({ msg: "Here are your user recall plan", recallsOfToday });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "We could not the user recall plans recall plan. Please try again later or open an issue on Github",
      error,
    });
  }
}
