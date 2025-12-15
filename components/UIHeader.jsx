import { Box } from "lucide-react";
import React from "react";

export default function UIHeader({ header }) {
  return (
    <>
      <div className="flex items-center justify-start w-full h-fit p-4 gap-2 border-b-1 border-default">
        <Box className="text-primary" />
        {header}
      </div>
    </>
  );
}
