"use client";
import { Spinner } from "@heroui/react";

export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2 border">
      <Spinner size="lg" color="none" />
      <span className="">{label}</span>
    </div>
  );
}
