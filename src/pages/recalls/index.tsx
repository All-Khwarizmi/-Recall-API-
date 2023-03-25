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

import differenceInDays from "date-fns/differenceInDays";

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

 // Fetching all user recall plans
  // Synchronizing userName input with user session data


 /*  const useFetcher = async () => {
      const { status, data: session } = useSession();
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: env.NEXT_PUBLIC_API_AUTH_HEADERS_KEY_GET_USER_RECALLS,
        },
        body: JSON.stringify({ userId: session?.user.id }),
      };
     if (status === "loading") {
    
     } else {
       const response = await fetch("http://localhost:3000/api/getUserRecalls", options)
       const data: RecallData = await response.json();
       console.log(data)
      return data 
         
     }
  }
const data = useFetcher() */

const Recalls: NextPage = () => {
  const [fetchedData, setFetchedData] = useState<any>();
  const [isLoading, setIsLoadging] = useState<boolean>();

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
   const  url = "http://localhost:3000/api/getUserRecalls"
 /*  const fetcher = (url: string, options: RequestInit) =>  fetch(url, options)
    .then((response) => {
      console.log("Response", response);
      return response.json();
    })
    .then((data: RecallData) => {
      console.log("Data", data);
      return data;
    });
  const { data, error } = useSWR("/api/getUserRecalls", fetcher); */
   
 
  useEffect(() => {
    if (status === "loading") {
      setIsLoadging(true);
    } else {
      const data = fetch("http://localhost:3000/api/getUserRecalls", options)
        .then((response) => {
          console.log("Response", response);
          return response.json();
        })
        .then((data) => {
          console.log("Data", data);
          const typedData = recallsScquema.safeParse(data);
          setFetchedData(data)
          console.log("typeddata", typedData);
          return data;
        })
        .catch((error) => {
          console.log(error);
        });
     
      
    }
  }, [status]);
 
  // console.log(fetchedData);
  console.log(env.NEXT_PUBLIC_API_GET_USER_RECALLS_ENDPOINT);

  if (status === "loading" || !fetchedData?.recall) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#005a80] to-[#0d003d] text-slate-100">
          <CgSpinner className="animate-spin text-7xl" />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center  bg-gradient-to-b from-[#005a80] to-[#0d003d] text-slate-100">
        <section className="intems-start flex h-full w-full">
          <div className="flex flex-row gap-5 p-5 md:p-10">
            <h1
              className="pb-2 text-5xl font-bold  
  first-letter:text-7xl first-letter:font-bold first-letter:text-white
  first-line:uppercase first-line:tracking-widest"
            >
              {" "}
              Recal
            </h1>
            <div className="flex items-center justify-center">
              <Link
                href={`/addRecall`}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              >
                Add recall
              </Link>
            </div>
            <div className="flex justify-end items-center">
              <div>
                <Image
                  src={`${session.user.image}`}
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
          <div className="grid h-full w-full grid-cols-1 place-items-center gap-4  md:grid-cols-4 md:gap-5">
            {fetchedData.recall.map((recall: any) => {
              return (
                <div
                  key={Math.floor(Math.random() * 1000)}
                  className="flex lg:max-w-lg flex-col gap-4 rounded-xl bg-white/10 p-6
            text-white hover:bg-white/20"
                >
                  <p className="text-3xl">{recall.topicName}</p>
                  <p className="italic text-gray-400">
                    Next recall in{" "}
                    {differenceInDays(new Date(recall.nextRecall), new Date())}{" "}
                    days
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
};

export default Recalls;
