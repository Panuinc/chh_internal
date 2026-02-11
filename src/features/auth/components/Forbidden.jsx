"use client";
import { Button } from "@heroui/button";
import { ShieldX } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function UIForbidden() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-default-100">
      <div className="flex flex-col items-center gap-2 max-w-md text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-background border border-default">
          <ShieldX className="w-6 h-6 text-default-400" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">
          Access Denied
        </h1>
        <p className="text-[13px] text-default-400 leading-relaxed">
          You do not have permission to access this page. Please contact your
          administrator if you need additional access rights.
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
