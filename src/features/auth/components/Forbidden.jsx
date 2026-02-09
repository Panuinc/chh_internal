"use client";
import { Button } from "@heroui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function UIForbidden() {
  return (
    <div className="flex flex-col items-center justify-center w-full xl:w-[80%] h-full p-2 gap-2 overflow-auto">
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
        <Image src="/icon/icon-ghost.png" alt="logo" width={250} height={250} />
      </div>
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2 text-5xl font-black">
        Access Denied!
      </div>
      <div className="flex items-center justify-center text-center w-6/12 h-fit p-2 gap-2 opacity-50">
        You do not have permission to access this page. Please contact your
        administrator if you need additional access rights.
      </div>
      <Link
        href="/home"
        className="flex items-center justify-center text-center w-4/12 h-fit p-2 gap-2"
      >
        <Button
          color="primary"
          variant="shadow"
          size="md"
          radius="md"
          className="w-full text-background"
        >
          Home
        </Button>
      </Link>
    </div>
  );
}
