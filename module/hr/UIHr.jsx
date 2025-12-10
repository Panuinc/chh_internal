"use client";
import { User2 } from "lucide-react";
import Link from "next/link";
import React from "react";

function SubMenu({ text, href }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center w-36 h-36 p-2 gap-2 border-1 border-foreground rounded-xl shadow hover:scale-105"
    >
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
        {text}
      </div>
    </Link>
  );
}

export default function UIHr() {
  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2">
      <div className="flex flex-col items-center justify-center w-full xl:w-2/12 h-full gap-2 border-1 border-foreground rounded-xl">
        1
      </div>
      <div className="flex flex-col items-center justify-center w-full xl:w-8/12 h-full gap-2 overflow-hidden">
        <div className="xl:flex flex-col items-center justify-start w-full min-h-52 p-2 gap-2 border-1 border-foreground rounded-xl hidden">
          <div className="flex items-center justify-start w-full h-fit p-2 gap-2 text-3xl">
            <User2 /> Human Resoure
          </div>
          <div className="flex items-center justify-start w-full h-fit p-2 gap-2 text-sm opacity-80">
            Your tools. Your workflow. Your operations.
          </div>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-3 place-items-center w-full h-full p-2 gap-2 overflow-auto">
          <SubMenu href="hr/department" text="Department" />
        </div>
      </div>
    </div>
  );
}
