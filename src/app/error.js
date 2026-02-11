"use client";

import { useEffect } from "react";
import { Button } from "@heroui/button";
import { AlertTriangle } from "lucide-react";

export default function RootError({ error, reset }) {
  useEffect(() => {
    console.error("[RootError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-2 bg-background">
      <div className="flex flex-col items-center gap-2 max-w-md text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-danger-50">
          <AlertTriangle className="w-8 h-8 text-danger-400" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Something went wrong
        </h2>
        <p className="text-sm text-default-500">
          {error?.message || "An unexpected error occurred"}
        </p>
        <Button
          size="sm"
          radius="sm"
          className="bg-foreground text-background font-medium hover:bg-default-800"
          onPress={reset}
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
