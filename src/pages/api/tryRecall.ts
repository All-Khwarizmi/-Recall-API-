import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { env } from "~/env.mjs";
import { z } from "zod";
import axios from "axios";
import { calendar } from "lib/helpers";

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

// Zod validation schema
const tryRecallSchema = z.object({
  userName: z.string(),
  botUrl: z.string(),
  topicName: z.string(),
  time: z.string(),
});
type RecallOfToday = z.infer<typeof tryRecallSchema>;
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
  console.log(req.body);
  if (req.headers.authorization !== env.API_AUTH_HEADERS_TRY_RECALL)
    return res
      .status(403)
      .json({ msg: "Your authorization header is not valid" });

  // Checking if request body is valid
  const parsedRequestData = tryRecallSchema.safeParse(req.body);
  console.log(parsedRequestData);
  if (!parsedRequestData.success)
    return res.status(400).json({
      msg: "Please be sure to fill the body of your request with valid data. Refer to API documentation.",
    });

  try {
    //  Creating calendar
    const newCalendar = calendar();

    // Creating message to send to user
    const message = `
    Hi ${parsedRequestData.data.userName},

    Here you have a recall plan to study ${parsedRequestData.data.topicName}
    ${newCalendar.recallOne}
    ${newCalendar.recallTwo}
    ${newCalendar.recallThree}
    ${newCalendar.recallFour}
    ${newCalendar.recallFive}
    ${newCalendar.recallSix}
    ${newCalendar.recallSeven}
    ${newCalendar.recallEight}
    ${newCalendar.recallNine}
    ${newCalendar.recallTen}
  
    You will be notified at ${parsedRequestData.data.time}

      Happy memorisation.

      The Recal team

    `;

    // Configuring fetch and sending message
     const optionsDiscord = {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({ content: message }),
     };
     const optionsSlack = {
       method: "POST",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify({ text: message }),
     };
    fetch(parsedRequestData.data.botUrl,
          parsedRequestData.data.botUrl.startsWith("https://discord")
            ? optionsDiscord
            : optionsSlack
    )
      .then((response) => {
        console.log("Fetch", response.status);
      })
      .catch((error) => {
        console.log("Fetch", error);
      })
      .finally(() => {
        console.log("Fetch finished sending messages");
        res.status(201).json({ msg: message });
        console.log("After sending message into HTTP response");
      }); 

/* 
    // Configuring axios to send messag
    const axiosConfigDiscord = {
      method: "POST",
      url: parsedRequestData.data.botUrl,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ content: message }),
    };
    const axiosConfigSlack = {
      method: "POST",
      url: parsedRequestData.data.botUrl,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ text: message }),
    };
    axios(
      parsedRequestData.data.botUrl.startsWith("https://discord")
        ? axiosConfigDiscord
        : axiosConfigSlack
    )
      .then(function (response: any) {
        console.log("Axios", response.status);
      })
      .catch(function (error) {
        console.log("Axios", error);
      })
      .finally(function () {
        console.log("Axios finished sending messages");
         res.json({ msg: message });
          console.log("After map message response to request");
      }); */
   
   
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "We could not the user recall plans recall plan. Please try again later or open an issue on Github",
      error,
    });
  }
}
