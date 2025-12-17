"use client";
import { Spinner } from "@heroui/react";

export default function LoadingState({}) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-2 gap-2">
      <Spinner color="primary" variant="wave" size="lg" />
    </div>
  );
}
