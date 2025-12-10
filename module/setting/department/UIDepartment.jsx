"use client";
import { Button } from "@heroui/react";
import Link from "next/link";
import React from "react";

export default function UIDepartment() {
  return (
    <div className="flex flex-col items-center justify-start w-full h-full gap-2 overflow-auto">
      <Link href="department/create" className="flex items-center justify-center w-full min-h-96 p-2 gap-2 border">
        <Button
          color="success"
          variant="solid"
          size="lg"
          className="w-6/12 text-background font-black"
        >
          Create Department
        </Button>
      </Link>
      <div className="flex items-center justify-center w-full min-h-96 p-2 gap-2 border">
        2
      </div>
      <div className="flex items-center justify-center w-full min-h-96 p-2 gap-2 border">
        3
      </div>
      <div className="flex items-center justify-center w-full min-h-96 p-2 gap-2 border">
        4
      </div>
      <div className="flex items-center justify-center w-full min-h-96 p-2 gap-2 border">
        5
      </div>
    </div>
  );
}
