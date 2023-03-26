import React, { useEffect, useState } from "react";
import Header from "~/components/Header";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CgSpinner } from "react-icons/cg";
import { env } from "~/env.mjs";
import Image from "next/image";
import { z } from "zod";
import { whatRecallDay, getNextRecallDay } from "lib/whatRecallDay";

import differenceInDays from "date-fns/differenceInDays";
import { Calendar } from "lib/helpers";

const recallsScquema = z.object({
  msg: z.string(),
  recall: z.array(
    z.object({
      topicName: z.string(),
      userId: z.string(),
      userEmail: z.string().email(),
      userImage: z.string(),
      userName: z.string(),
      lastRecall: z.string(),
      nextRecall: z.string(),
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
    })
  ),
});
type RecallData = z.infer<typeof recallsScquema>;

const Recalls: NextPage = () => {
  const [fetchedData, setFetchedData] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [isDataButNotRecall, setIsDataButNotRecall] = useState<boolean>(false);
  const [isRecallInDB, setIsRecallInDB] = useState<boolean>(false);

  // Checking if user is authenticated, redirecting otherwise
  const router = useRouter();
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.back();
    },
  });
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: env.NEXT_PUBLIC_API_AUTH_HEADERS_KEY_GET_USER_RECALLS,
    },
    body: JSON.stringify({ userId: session?.user.id }),
  };

  // Fetching all user recalls
  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
    } else {
      // "http://localhost:3000/api/getUserRecalls"
      // env.NEXT_PUBLIC_API_GET_USER_RECALLS_ENDPOINT
      const data = fetch("http://localhost:3000/api/getUserRecalls", options)
        .then((response) => {
          console.log("Response", response);
          return response.json();
        })
        .then((data) => {
          console.log("Data", data, "Data.message", data.message);
          if (data.message === "No recall in database") {
            setIsDataButNotRecall(true);
            setIsRecallInDB(false);
          }
          const typedData = recallsScquema.safeParse(data);
          if (typedData.success) {
            const safeData = typedData.data;
            setIsError(false);
            setIsRecallInDB(true);
            setFetchedData(safeData);
          } else if (!typedData.success && !isDataButNotRecall) {
            setIsError(true);
          }
          console.log("typeddata", typedData);
          return data;
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [status, isDelete]);

  // Handle delete recall
  const handleDelete = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | any
  ) => {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: env.NEXT_PUBLIC_API_AUTH_HEADERS_KEY_DELETE_USER_RECALL,
      },
      body: JSON.stringify({
        userId: session?.user.id,
        topicName: e.target.name,
      }),
    };
    const isUserSure = confirm("Are you sure?");
   
    if (isUserSure) {
      console.log("Sure");
      fetch(env.NEXT_PUBLIC_API_DELETE_USER_RECALL_ENDPOINT, options)
        .then((response) => {
          console.log(response.ok);
          if (response.ok) {
            setIsDelete(!isDelete);
          }
        })
        .catch((error) => console.log(error));
    } 
  };

  // Handle update recall
  const handleUpdate = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | any,
    nextRecallName: string,
    calendar: Calendar
  ) => {
    // configuring the new data to update the recall plan
    const calendarMap = new Map(Object.entries(calendar));
    const nextRecallDayValueUpdated = calendarMap.get(
      getNextRecallDay(nextRecallName)
    );
    const nextRecallNameUpdated = getNextRecallDay(nextRecallName);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: env.NEXT_PUBLIC_API_AUTH_HEADERS_KEY_UPDATE_USER_RECALL,
      },
      body: JSON.stringify({
        userId: session?.user.id,
        topicName: e.target.name,
        nextRecallName: nextRecallNameUpdated,
        nextRecall: nextRecallDayValueUpdated,
      }),
    };
    // Asking if user has really done the study session
    const isUserSure = confirm("Did you really study this topic? 🤯 ");

    // "http://localhost:3000/api/updateRecall"
    //NEXT_PUBLIC_API_UPDATE_USER_RECALL_ENDPOINT
    if (isUserSure) {
      console.log("Sure");

      fetch(env.NEXT_PUBLIC_API_UPDATE_USER_RECALL_ENDPOINT, options)
        .then((response) => {
          console.log(response.ok);
          if (response.ok) {
            setIsDelete(!isDelete);
          }
        })
        .catch((error) => console.log(error));
    } 
  };

  const handleHelp = () => {
    alert("TODO");
  };
/*   if (status === "loading" || (!fetchedData?.recall && !isDataButNotRecall)) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#005a80] to-[#0d003d] text-slate-100">
          <CgSpinner className="animate-spin text-7xl" />
        </main>
      </>
    );
  } else if (isError && !isDataButNotRecall) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#005a80] to-[#0d003d] text-slate-100">
          <h1 className="text-3xl font-bold uppercase text-red-600">
            Something went wrong
          </h1>
          <h1 className="p-2 font-bold tracking-wider">
            Please try to reload the page or open an issue on Github
          </h1>
        </main>
      </>
    );
  } */

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center  bg-gradient-to-b from-[#005a80] to-[#0d003d] text-slate-100">
        <section className="intems-start flex h-full w-full">
          <div className="flex flex-row gap-5 p-5 md:p-10">
            <h1
              className="pb-2 font-bold first-letter:text-7xl  
  first-letter:font-bold first-letter:text-white first-line:uppercase
  first-line:tracking-widest md:text-5xl"
            >
              {" "}
              Recal
            </h1>
            <div className="flex items-center justify-center">
              <Link
                href={`/addRecall`}
                className="rounded-full bg-white/10 px-5 py-3 font-semibold uppercase text-white no-underline transition hover:bg-white/20 md:px-10"
              >
                Add
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleHelp}
                className="rounded-full bg-white/10 px-5 py-3 font-semibold uppercase text-white no-underline transition hover:bg-white/20 md:px-10"
              >
                help me
              </button>
            </div>
            <div className="flex items-center justify-end">
              <div>
                <Image
                  src={`${session?.user.image}`}
                  width={40}
                  height={40}
                  alt="user image"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="flex h-full w-full ">
          <div className="flex h-full w-full flex-col place-items-center gap-4 px-2 pb-5 md:grid-cols-4 md:gap-5">
            {isRecallInDB &&
              fetchedData.recall.map((recall: any) => {
                return (
                  <div
                    key={Math.floor(
                      Math.random() * 1000 * (Math.random() * 1000)
                    )}
                    className="flex w-full flex-col gap-4 rounded-xl bg-white/10 p-6 px-4 text-white
            hover:bg-white/20 lg:max-w-lg"
                  >
                    <div className="flex justify-between">
                      <p className="text-3xl">{recall.topicName}</p>
                      <div className="flex gap-2">
                        {whatRecallDay(
                          recall.lastRecall,
                          recall.nextRecall,
                          recall.nextRecallName,
                          recall.calendar
                        ) === "late" ||
                        whatRecallDay(
                          recall.lastRecall,
                          recall.nextRecall,
                          recall.nextRecallName,
                          recall.calendar
                        ) === "study" ? (
                          <div className="flex">
                            <button
                              type="button"
                              className="rounded-xl bg-green-400 p-2 text-xs font-bold uppercase tracking-wider"
                              name={recall.topicName}
                              onClick={(e) =>
                                handleUpdate(
                                  e,
                                  recall.nextRecallName,
                                  recall.calendar
                                )
                              }
                            >
                              done
                            </button>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          className="rounded-xl bg-red-400 p-2 text-xs font-bold uppercase tracking-wider"
                          name={recall.topicName}
                          onClick={(e) => handleDelete(e)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {whatRecallDay(
                      recall.lastRecall,
                      recall.nextRecall,
                      recall.nextRecallName,
                      recall.calendar
                    ) === "ok" ? (
                      <p className="italic text-gray-400">
                        {differenceInDays(
                          new Date(recall.nextRecall),
                          new Date()
                        )}{" "}
                        days from now
                      </p>
                    ) : null}
                    {whatRecallDay(
                      recall.lastRecall,
                      recall.nextRecall,
                      recall.nextRecallName,
                      recall.calendar
                    ) === "study" ? (
                      <div className="flex">
                        <p className="animate-pulse rounded-lg bg-green-400 p-1 text-sm uppercase italic">
                          study
                        </p>
                      </div>
                    ) : null}
                    {whatRecallDay(
                      recall.lastRecall,
                      recall.nextRecall,
                      recall.nextRecallName,
                      recall.calendar
                    ) === "late" ? (
                      <div className="flex">
                        <p className="animate-pulse rounded-lg bg-red-400 p-1 text-sm uppercase italic">
                          Late
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              }).reverse()}

            {isDataButNotRecall && (
              <div
                className="flex w-full flex-col gap-4 rounded-xl bg-white/10 p-6 px-4 text-white
            hover:bg-white/20 lg:max-w-lg"
              >
                <p className=" text-bold text-center text-3xl tracking-wider text-slate-200">
                  No recall plan yet
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Recalls;


