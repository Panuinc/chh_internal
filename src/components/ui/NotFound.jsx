"use client";
import { Button } from "@heroui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function UINotFound() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-default-100">
      <div className="flex flex-col items-center gap-2 max-w-md text-center">
        <Image src="/icon/icon-ghost.png" alt="not found" width={100} height={100} />
        <h1 className="text-lg font-semibold text-foreground">
          Page not found
        </h1>
        <p className="text-[13px] text-default-400 leading-relaxed">
          We couldn&apos;t find the page you were looking for. It may have been moved or deleted.
        </p>
        <Link href="/home">
          <Button
            size="sm"
            radius="sm"
            className="bg-foreground text-background font-medium hover:bg-default-800"
          >
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
