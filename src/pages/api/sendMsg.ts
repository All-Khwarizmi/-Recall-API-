import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { env } from "~/env.mjs";
import { z } from "zod";
import axios from "axios";

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
const recallsOfTodaySchema = z.object({
  msg: z.string(),
  recallObj: z.array(
    z.object({
      userName: z.string(),
      userId: z.string(),
      botUrl: z.string(),
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

  // Checking if authorization header is valid
  console.log(req.body);
  if (req.body.content !== env.API_AUTH_HEADERS_SEND_MSG)
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
      env.API_RECALL_OF_THE_DAY_ENDPOINT,
      optionsRecallOfToday
    );
    const recallsOfToday: RecallOfToday = await responseRecallOfToday.json();

    // Validating incoming data from recalls of today service
    const parsedRecallsOfToday = recallsOfTodaySchema.safeParse(recallsOfToday);
    console.log("In sendMsg", parsedRecallsOfToday);


    /* *
     * Helper function to parse incoming data containing the recall plans of today.
     * @function
     * @param {RecallOfToday} Recall plans of the day.
     *
     */
    const recallsOfTodayParser = (data: RecallOfToday) => {
      // Declaring variables. We use a set to filter since we need uniqueness
      let filterObj: Set<string> = new Set();
      let newRecallObj: any = {};
      let a = 0;
      const len = data.recallObj.length;

      // Let's loop over all the recalls and make a new object containing a single entry for each user that has some topic to recall today
      if (len) {
        while (a < len) {
          // Check if userId is in set already
          if (filterObj.has(data.recallObj[a]!.userId)) {
            // If so add the topic to the topics array
            newRecallObj[data.recallObj[a]!.userId].topics.push(
              data.recallObj[a]!.name
            );
          } else {
            // If not creates a userId property into the newRecallObj and instantiate it with an object
            if (data.recallObj[a]!.userId) {
              newRecallObj[data.recallObj[a]!.userId] = {
                name: data.recallObj[a]!.userName,
                discordBotUrl: data.recallObj[a]!.botUrl,
                topics: [data.recallObj[a]!.name],
              };
            }
            // And add the userId to the filterObj helper set
            filterObj.add(data.recallObj[a]!.userId);
          }

          a++;
        }
      }

      return newRecallObj;
    };

    // Mapping over recalls of the day if any in order to filter the incoming data. That is making that we only send an message to the end user containing all the topics of the day despite having pontentially various topics object for a single user in the incoming data.
    if (
      parsedRecallsOfToday.success &&
      parsedRecallsOfToday.data.recallObj.length
    ) {
      const newRecallObj = recallsOfTodayParser(recallsOfToday);
      console.log("New recalls", newRecallObj);

      // Getting keys in rewRecallObj to loop over it and send message to each user
      const newRecallObjKeys = Object.keys(newRecallObj);

      // Looping over each key and sending message to user
      newRecallObjKeys.forEach((user) => {
        const message = `
    Hi ${newRecallObj[user].name},
    
Today you should study the following topics :
 ${newRecallObj[user].topics
   .map((item: string) => "- " + item + "\n")
   .join(" ")
   .toString()}

  Happy memorisation.

  The Recal team
  `;
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

        fetch(
          newRecallObj[user].botUrl,
          newRecallObj[user].botUrl.startsWith("https://discord")
            ? optionsDiscord
            : optionsSlack
        )
          .then((response) => {
            console.log("Fetch", response.status);
          })
          .catch((error) => {
            console.log(error);
          })
          .finally(() => {
            console.log("Fetch finished sending messages");
            res
              .status(201)
              .json({ msg: "Here are your user recall plan", newRecallObj });
            console.log("After sending message into HTTP response");
          });

        /*    const axiosConfigDiscord = {
          method: "POST",
          url: newRecallObj[user].discordBotUrl,
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({ content: message }),
        };
        const axiosConfigSlack = {
          method: "POST",
          url: newRecallObj[user].discordBotUrl,
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({ text: message }),
        };
        axios(
          newRecallObj[user].discordBotUrl.startsWith("https://discord")
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
          }); */
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "We could not the user recall plans recall plan. Please try again later or open an issue on Github",
      error,
    });
  }
}
