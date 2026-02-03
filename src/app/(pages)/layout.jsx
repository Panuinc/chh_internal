"use client";
import { useState } from "react";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LoadingState } from "@/components";

export default function PagesLayout({ children }) {
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut({ callbackUrl: "/signIn" });
  };

  if (status === "loading") {
    return <LoadingState />;
  }

  const userInitial =
    session?.user?.firstName?.charAt(0).toUpperCase() ||
    session?.user?.name?.charAt(0).toUpperCase() ||
    "U";

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <header className="flex flex-row items-center justify-between w-full h-fit p-2 gap-2 border-b-1 border-default">
        <Link
          href="/home"
          className="flex items-center justify-start w-full xl:min-w-12 h-12 p-2 gap-2"
        >
          <Image src="/logo/logo-04.png" alt="logo" width={125} height={125} />
        </Link>

        <div className="xl:flex items-center justify-center w-full h-full p-2 gap-2 hidden"></div>

        <div className="flex items-center justify-center aspect-square h-full p-2 gap-2 bg-primary text-background shadow-md rounded-xl cursor-pointer hover:bg-primary/50">
          {userInitial}
        </div>

        <div
          onClick={!isSigningOut ? handleSignOut : undefined}
          className={`flex items-center justify-center aspect-square h-full p-2 gap-2 bg-primary text-background shadow-md rounded-xl cursor-pointer hover:bg-primary/50
    ${
      isSigningOut
        ? "opacity-50 cursor-not-allowed"
        : "cursor-pointer hover:bg-default"
    }`}
        >
          <LogOut />
        </div>
      </header>

      <main className="flex items-center justify-center w-full h-full gap-2 overflow-hidden">
        {children}
      </main>

      <footer className="flex flex-row items-center justify-center w-full h-fit p-2 gap-2 border-t-1 border-default">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          EVERGREEN BY CHH
        </div>
      </footer>
    </div>
  );
}
