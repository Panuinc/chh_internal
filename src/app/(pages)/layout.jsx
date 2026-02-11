"use client";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LoadingState, Sidebar } from "@/components";
import TopBar from "@/components/layout/TopBar";
import StatusBar from "@/components/layout/StatusBar";

export default function PagesLayout({ children }) {
  const { data: session, status } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  const userName =
    session?.user?.name ||
    (session?.user?.firstName && session?.user?.lastName
      ? `${session.user.firstName} ${session.user.lastName}`
      : session?.user?.firstName || "User");

  const userRole = session?.user?.isSuperAdmin ? "Administrator" : "User";

  return (
    <div className="flex flex-col w-full h-full">
      <TopBar
        userName={userName}
        userRole={userRole}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={() =>
          setIsMobileSidebarOpen(!isMobileSidebarOpen)
        }
      />

      <div className="flex flex-1 min-h-0">
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 xl:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <div className="hidden xl:flex h-full">
          <Sidebar
            userInitial={userInitial}
            isSigningOut={isSigningOut}
            onSignOut={handleSignOut}
          />
        </div>

        <div
          className={`fixed inset-y-0 left-0 z-50 flex xl:hidden transition-transform duration-200 ${
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            userInitial={userInitial}
            isSigningOut={isSigningOut}
            onSignOut={handleSignOut}
          />
        </div>

        <main className="flex flex-col flex-1 min-w-0 overflow-auto bg-background">
          {children}
        </main>
      </div>

      <StatusBar />
    </div>
  );
}
