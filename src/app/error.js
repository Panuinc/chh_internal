"use client";

import { useEffect } from "react";
import { Button } from "@heroui/react";

export default function RootError({ error, reset }) {
  useEffect(() => {
    console.error("[RootError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md">
        <h2 className="mb-4 text-2xl font-bold text-danger">
          Something went wrong!
        </h2>
        <p className="mb-6 text-default-600">
          {error?.message || "An unexpected error occurred"}
        </p>
        <Button color="primary" onPress={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
