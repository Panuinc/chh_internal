"use client";
import { Button } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function UIForbidden() {
  return (
    <div className="flex flex-col items-center justify-center w-full xl:w-10/12 h-full p-2 gap-2 border overflow-auto">
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border">
        <Image src="/icon/icon-ghost.png" alt="logo" width={250} height={250} />
      </div>
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2 border text-7xl">
        Access Denied!
      </div>
      <div className="flex items-center justify-center text-center w-6/12 h-fit p-2 gap-2 border text-xl opacity-50">
        You do not have permission to access this page. Please contact your
        administrator if you need additional access rights.
      </div>
      <Link
        href="/home"
        className="flex items-center justify-center text-center w-4/12 h-fit p-2 gap-2 border"
      >
        <Button
          color="none"
          variant="solid"
          size="lg"
          className="w-full"
        >
          Home
        </Button>
      </Link>
    </div>
  );
}
