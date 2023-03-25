import React from "react";
import Header from "~/components/Header";
import { useState, useRef } from "react";
import { env } from "~/env.mjs";

const Tryout = () => {
  const [userName, setUserName] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [botUrl, setBotUrl] = useState<string>("");

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };
  const handleTopicNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value);
  };
  const handleBotUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBotUrl(e.target.value);
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (!botUrl.startsWith("https://")) {
      return alert("Please be sure to enter a valid url");
    }

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: env.NEXT_PUBLIC_API_AUTH_HEADERS_TRY_RECALL,
      },
      body: JSON.stringify({ userName, topicName: topic, botUrl }),
    };

    const data: unknown = fetch(
      env.NEXT_PUBLIC_API_TRY_RECALL_ENDPOINT,
      options
    )
      .then((response) => {
        console.log(response);
        if (response.ok) {
          window.alert(
            "Message sent successfully. Please check your messaging app channel"
          );
          setTopic("");
          setBotUrl("");

          setUserName("");
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
        <section className="h-full pt-10 w-[90%] md:w-[60%]">
          <h1
            className="pb-3 text-5xl font-bold  
  first-letter:text-7xl first-letter:font-bold first-letter:text-white
  first-line:uppercase first-line:tracking-widest"
          >
            {" "}
            Recal
          </h1>
          
          <form className="flex flex-col md:pt-10 pt-5">
            <label htmlFor="topic" className="pb-2 uppercase tracking-wider">
              Your name
            </label>
            <input
              required
              autoFocus
              id="user name"
              name="user name"
              type="text"
              value={userName}
              onChange={(e) => handleUserNameChange(e)}
              className="focus-visible  grow rounded-lg border border-gray-600 bg-transparent py-1 px-2 tracking-wide  focus:outline-slate-300"
              placeholder="Mark"
            />
            <div className="p-3"></div>
            <label htmlFor="topic" className="pb-2 uppercase tracking-wider">
              Topic name
            </label>
            <input
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

export default Tryout;
