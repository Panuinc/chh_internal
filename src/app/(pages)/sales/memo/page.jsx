"use client";

import React from "react";
import { useMenu } from "@/hooks";
import UIMemo from "@/app/(pages)/sales/_components/memo/UIMemo";

export default function MemoPage() {
  const { hasPermission } = useMenu();

  if (!hasPermission("sales.memo.view")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-danger">
          You do not have permission to access this page
        </p>
      </div>
    );
  }

  return <UIMemo />;
}
