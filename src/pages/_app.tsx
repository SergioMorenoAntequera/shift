import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { api } from "~/utils/api";
import "~/styles/globals.css";

import React from 'react'
import { useRouter } from "next/router";

const Header: React.FC = () => {
  const { data:sessionData } = useSession()
  const router = useRouter()

  return (
    <div className="p-6 bg-neutral-500 w-full flex items-center justify-between gap-4 text-white">
      <div className="flex items-center gap-4">
        <div className="cursor-pointer" onClick={()=> {void router.push("/")}}>
          HOME
        </div>
        <div>
          <p className="text-2xl">
            {sessionData && <span> Hey {sessionData?.user?.name}!</span>}
          </p>
          <p className="text-sm">
            {sessionData && <span> {sessionData?.user?.id} </span>}
          </p>
        </div>
      </div>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};


type Props = { children: React.ReactElement}
function Layout({children}:Props) {

  return (<div>
    
    <div><Header/></div>

    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container text-white">
        {children}
      </div>
    </div>
  </div>)
}

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
