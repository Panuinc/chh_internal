"use client";
import { Button } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function UINotFound() {
  return (
    <div className="flex flex-col items-center justify-center w-full xl:w-[80%] h-full p-2 gap-2 overflow-auto">
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
        <Image src="/icon/icon-ghost.png" alt="logo" width={250} height={250} />
      </div>
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2 text-5xl font-black">
        Whoops!
      </div>
      <div className="flex items-center justify-center text-center w-6/12 h-fit p-2 gap-2 opacity-50">
        We Couldn't find the page you were looking for.
      </div>
      <Link
        href="/home"
        className="flex items-center justify-center text-center w-4/12 h-fit p-2 gap-2"
      >
        <Button
          color="default"
          variant="bordered"
          size="md"
          radius="md"
          className="w-full"
        >
          Home
        </Button>
      </Link>
    </div>
  );
}
