"use client";
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

export default function UISetting() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 place-items-center w-full xl:w-6/12 h-full p-2 gap-2 border overflow-auto">
      <SubMenu href="setting/department" text="Department" />
    </div>
  );
}
