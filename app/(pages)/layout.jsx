"use client";
import { useState } from "react";
import { BellDot, LogOut } from "lucide-react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@heroui/react";
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
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      <header className="flex flex-row items-center justify-between w-full h-fit p-2 gap-2 bg-foreground">
        <Link
          href="/home"
          className="flex items-center justify-start w-full xl:min-w-60 h-full p-2 gap-2"
        >
          <Image src="/logo/logo-08.png" alt="logo" width={125} height={125} />
        </Link>

        <div className="xl:flex items-center justify-center w-full h-full p-2 gap-2 hidden"></div>

        <div className="flex items-center justify-center min-w-12 min-h-12 p-2 gap-2 bg-background text-foreground rounded-full font-semibold">
          {userInitial}
        </div>

        <div className="flex items-center justify-center min-w-12 min-h-12 p-2 gap-2 bg-background text-foreground rounded-full cursor-pointer hover:opacity-80 transition-opacity">
          <BellDot />
        </div>

        <Button
          onPress={handleSignOut}
          isDisabled={isSigningOut}
          isIconOnly
          radius="full"
          className="flex items-center justify-center min-w-12 min-h-12 p-2 gap-2 bg-background text-foreground"
        >
          <LogOut />
        </Button>
      </header>

      <main className="flex items-center justify-center w-full h-full gap-2 overflow-hidden">
        {children}
      </main>

      <footer className="flex flex-row items-center justify-center w-full h-fit p-2 gap-2 bg-foreground">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-background">
          EVERGREEN BY CHH
        </div>
      </footer>
    </div>
  );
}
