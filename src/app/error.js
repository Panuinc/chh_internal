"use client";

import { useEffect } from "react";
import { Button } from "@heroui/react";

export default function RootError({ error, reset }) {
  useEffect(() => {
    console.error("Root error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-600">
          Something went wrong!
        </h2>
        <p className="mb-6 text-gray-600">
          {error?.message || "An unexpected error occurred"}
        </p>
        <Button color="primary" onPress={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
