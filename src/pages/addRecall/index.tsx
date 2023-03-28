import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import Header from "~/components/Header";
import { env } from "~/env.mjs";
import { calendar } from "lib/helpers";
import { CgSpinner } from "react-icons/cg";
import Link from "next/link";

const AddRecall: NextPage = () => {
  // Checking if user is authenticated, redirecting otherwise
  const router = useRouter();
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.back();
    },
  });

  const [userName, setUserName] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [botUrl, setBotUrl] = useState<string>("");
  const newCalendar = useMemo(calendar, []);

  const options = useMemo(() => {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: env.NEXT_PUBLIC_API_AUTH_HEADERS_ADD_RECALL,
      },
      body: JSON.stringify({
        userName,
        topicName: topic,
        botUrl,
        userEmail: session?.user.email,
        userId: session?.user.id,
        userImage: session?.user.image,
        calendar: newCalendar,
        lastRecall: new Date(),
        nextRecallName: "recallOne",
        nextRecall: new Date(newCalendar.recallOne),
      }),
    };
  }, [botUrl, userName]);
  // Synchronizing userName input with user session data
  useEffect(() => {
    if (status === "loading") {
      setUserName("");
    } else {
      setUserName(session?.user.name!);
    }
  }, [status]);

  // Displaying spinner while loading user session data
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

  // Input and validation form handlers
  const handleTopicNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };
  const handleBotUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBotUrl(e.target.value);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (!botUrl.startsWith("https://") || topic.length < 2) {
      return alert(
        "Please be sure to enter a valid url and valid topic name, minimum two characters long!"
      );
    }

    console.log(JSON.parse(options.body));

    const data: unknown = fetch(
      env.NEXT_PUBLIC_API_ADD_RECALL_ENDPOINT,
      options
    )
      .then((response) => {
        console.log(response);
        if (response.ok && response.status !== 208) {
          window.alert(
            "Recall added successfully. Please check your dashboard"
          );
          setTopic("");
          setBotUrl("");
        } else if (response.status === 208) {
          window.alert(
            "Recall already in database. Please choose another topic name"
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        return data;
      })
      .catch((error) => console.log(error));
    console.log(data);
  };
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#005a80] to-[#0d003d] text-slate-100">
        <section className="h-full w-[90%] pt-10 md:w-[60%]">
          <div className="flex gap-4">
            <h1
              className="pb-3 text-5xl font-bold  
  first-letter:text-7xl first-letter:font-bold first-letter:text-white
  first-line:uppercase first-line:tracking-widest"
            >
              {" "}
              Recal
            </h1>
            <div className="flex w-full items-center justify-end">
              <Link
                href={`/recalls`}
                className="rounded-full bg-white/10 px-5 py-3 font-semibold text-white no-underline transition hover:bg-white/20 md:px-10"
              >
                Dashboard
              </Link>
            </div>
          </div>
          <form className="flex flex-col pt-5 md:pt-10">
            <label
              htmlFor="topic"
              className="w-[80%] pb-2 uppercase tracking-wider"
            >
              Your name
            </label>
            <input
              disabled
              id="user name"
              name="user name"
              type="text"
              value={userName}
              className="focus-visible grow rounded-lg border border-gray-600 bg-transparent py-1 px-2 tracking-wide text-gray-500  focus:outline-slate-300"
            />
            <div className="p-3"></div>
            <label htmlFor="topic" className="pb-2 uppercase tracking-wider">
              Topic name
            </label>
            <input
              autoFocus
              required
              id="topic"
              name="topic"
              type="text"
              value={topic}
              onChange={(e) => handleTopicNameChange(e)}
              className="focus-visible  grow rounded-lg border border-gray-600 bg-transparent py-1 px-2 tracking-wide  focus:outline-slate-300"
              placeholder="Algebra"
            />
            <div className="p-3"></div>
            <label
              htmlFor="messaging bot url"
              className="pb-2 uppercase tracking-wider"
            >
              Messaging bot url{" "}
            </label>
            <input
              required
              id="messaging bot url"
              name="messaging bot url"
              type="url"
              pattern="https://.*"
              onChange={(e) => handleBotUrlChange(e)}
              value={botUrl}
              className="grow  rounded-lg border border-gray-600 bg-transparent py-1 px-2 tracking-wide ring-slate-300 focus:outline-slate-300"
              placeholder="https://discord.com/api/webhooks/1088529850555433010/IDMlYPu"
            />
            <div className="p-5"></div>

            <button
              type="submit"
              className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={(e) => handleSubmit(e)}
            >
              Send
            </button>
          </form>
        </section>
      </main>
    </>
  );
};

export default AddRecall;
