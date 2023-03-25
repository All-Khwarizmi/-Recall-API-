import { type NextPage } from "next";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

import { api } from "~/utils/api";
import Header from "~/components/Header";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();

  return (
    <>
     <Header />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#005a80] to-[#0d003d] text-slate-100">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            <Image
              priority
              src={"/memory-recall.png"}
              width={300}
              height={300}
              alt="codice logo"
            />
          </h1>
          <div className="w-screen text-center">
            <h1
              className="pb-2 text-5xl font-bold  
  first-letter:text-7xl first-letter:font-bold first-letter:text-white
  first-line:uppercase first-line:tracking-widest"
            >
              {" "}
              Recal
            </h1>
            <h3 className="italic text-gray-400">The best way to learn</h3>
          </div>

          <div className="flex flex-row items-center gap-2">
            <AuthShowcase />
            {sessionData?.user ? (
              <Link
                href={"./recalls"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              >
                Enter
              </Link>
            ) : (
              <Link
                href={"./tryout"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              >
                Tryout
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
