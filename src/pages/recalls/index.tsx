import React, { useEffect, useState } from "react";
import Header from "~/components/Header";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CgSpinner } from "react-icons/cg";
import { env } from "~/env.mjs";

const Recalls: NextPage = () => {
  const [fetchedData, setFetchedData] = useState<unknown>();
  const [isLoading, setIsLoadging] = useState<boolean>();

  // Checking if user is authenticated, redirecting otherwise
  const router = useRouter();
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.back();
    },
  });

  // Fetching all user recall plans
  // Synchronizing userName input with user session data
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: env.NEXT_PUBLIC_API_AUTH_HEADERS_KEY_GET_USER_RECALLS,
    },
    body: JSON.stringify({ userId: session?.user.id }),
  };

  useEffect(() => {
    if (status === "loading") {
      setIsLoadging(true);
    } else {
      const data = fetch(env.NEXT_PUBLIC_API_GET_USER_RECALLS_ENDPOINT, options)
        .then((response) => {
          console.log("Response", response);
          return response.json();
        })
        .then((data) => {
          console.log("Data", data);
          return data;
        })
        .catch((error) => {
          console.log(error);
        });
      setFetchedData(data);
    }
  }, [status]);

  // console.log(fetchedData);
  console.log(env.NEXT_PUBLIC_API_GET_USER_RECALLS_ENDPOINT);
  console.log(env.NEXT_PUBLIC_API_GET_USER_RECALLS_ENDPOINT2);

  if (status === "loading") {
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#005a80] to-[#0d003d] text-slate-100">
        <p>Recalls</p>
        <Link
          href={`/addRecall`}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        >
          Add recall
        </Link>
      </main>
    </>
  );
};

export default Recalls;
