import { NextApiRequest, NextApiResponse } from "next";
type RequestCheckerReturn = {
  response: void;
  isMethodOk: boolean;
};
type RequestChecker = (
  req: NextApiRequest,
  res: NextApiResponse,
  method: string
) => RequestCheckerReturn;
export const requestMethodChecker: RequestChecker = (
  req: NextApiRequest,
  res: NextApiResponse,
  method: string
) => {
  if (req.method !== method) {
    const methodChecked = {
      response: res.status(400).json({
        message:
          "Please be sure to fulfill the API request method requirements",
      }),
      isMethodOk: false,
    };
    return methodChecked;
  }
  const methodChecked = {
    response: res.status(400).json({
      message: "Please be sure to fulfill the API request method requirements",
    }),
    isMethodOk: true,
  };
  return methodChecked;
};
