"use client";
import React from "react";

export default function ModulePage({
  icon,
  title,
  description = "Your tools. Your workflow. Your operations.",
  sidebar,
  children,
}) {
  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2">
      <div className="flex flex-col items-center justify-center w-full xl:w-2/12 h-full gap-2 border-1 border-foreground rounded-xl">
        {sidebar}
      </div>

      <div className="flex flex-col items-center justify-center w-full xl:w-8/12 h-full gap-2 overflow-hidden">
        <div className="xl:flex flex-col items-center justify-start w-full min-h-52 p-2 gap-2 border-1 border-foreground rounded-xl hidden">
          <div className="flex items-center justify-start w-full h-fit p-2 gap-2 text-3xl">
            {icon} {title}
          </div>
          <div className="flex items-center justify-start w-full h-fit p-2 gap-2 text-sm opacity-80">
            {description}
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-3 place-items-center w-full h-full p-2 gap-2 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
