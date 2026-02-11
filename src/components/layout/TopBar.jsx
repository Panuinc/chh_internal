"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Bell, Menu, X } from "lucide-react";

export default function TopBar({
  userName = "User",
  userRole = "User",
  isMobileSidebarOpen,
  onToggleMobileSidebar,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  return (
    <header className="flex items-center justify-between h-10 p-2 bg-background border-b border-default shrink-0 z-30">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-md hover:bg-default-100 text-default-500 transition-colors xl:hidden cursor-pointer"
        >
          {isMobileSidebarOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Menu className="w-4 h-4" />
          )}
        </button>

        <Link href="/home" className="flex items-center gap-2">
          <Image
            src="/logo/logo-01.png"
            alt="logo"
            width={20}
            height={20}
            className="xl:hidden"
          />
          <div className="hidden xl:flex items-center gap-2">
            <span className="text-[13px] font-semibold text-foreground">
              EverGreen
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden xl:flex items-center gap-2 text-[11px] text-default-400">
          <span>{formatDate(currentTime)}</span>
          <span className="text-default-300">|</span>
          <span className="font-mono">{formatTime(currentTime)}</span>
        </div>

        <button className="relative flex items-center justify-center w-8 h-8 rounded-md text-default-400 hover:bg-default-100 hover:text-default-600 transition-colors cursor-pointer">
          <Bell className="w-[15px] h-[15px]" strokeWidth={1.5} />
        </button>

        <div className="hidden xl:flex items-center gap-2  border-l border-default">
          <div className="text-right">
            <div className="text-[11px] font-medium text-default-700 leading-tight">
              {userName}
            </div>
            <div className="text-[10px] text-default-400 leading-tight">
              {userRole}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
