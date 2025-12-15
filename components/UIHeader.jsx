import { Box } from "lucide-react";
import React from "react";

export default function UIHeader({ header }) {
  return (
    <>
      <div className="flex items-center justify-start w-full xl:w-10/12 h-fit p-4 gap-2 border-b-2 border-foreground">
        <Box className="text-primary" />
        {header}
      </div>
    </>
  );
}
