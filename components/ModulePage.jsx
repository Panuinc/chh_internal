"use client";
import React from "react";

export default function ModulePage({
  icon,
  title,
  description = "Your tools. Your workflow. Your operations.",
  sidebar,
  children,
  showHeader = true,
  showSidebar = true,
}) {
  return (
    <div className="flex flex-col xl:flex-row items-center justify-center w-full h-full gap-2">
      {showSidebar && (
        <div className="flex flex-col items-center justify-center w-full xl:w-2/12 h-full p-2 gap-2 border-2 border-foreground rounded-xl">
          {sidebar || (
            <div className="text-sm text-foreground/50">No sidebar content</div>
          )}
        </div>
      )}

      <div
        className={`flex flex-col items-center justify-center w-full ${
          showSidebar ? "xl:w-8/12" : "xl:w-10/12"
        } h-full gap-2 overflow-hidden`}
      >
        {showHeader && (
          <div className="xl:flex flex-col items-center justify-start w-full min-h-52 p-4 gap-2 border-2 border-foreground rounded-xl hidden">
            <div className="flex items-center justify-start w-full h-fit p-2 gap-3 text-3xl font-semibold">
              {icon} {title}
            </div>
            <div className="flex items-center justify-start w-full h-fit p-2 gap-2 text-sm opacity-80">
              {description}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 xl:grid-cols-3 place-items-center w-full h-full p-2 gap-4 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
