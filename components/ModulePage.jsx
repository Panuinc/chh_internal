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
        <div className="flex flex-col items-center justify-center w-full xl:w-[20%] h-full gap-2">
          {sidebar || (
            <div >No sidebar content</div>
          )}
        </div>
      )}

      <div
        className={`flex flex-col items-center justify-center w-full ${
          showSidebar ? "xl:w-[80%]" : "xl:w-[80%]"
        } h-full gap-2 overflow-hidden`}
      >
        {showHeader && (
          <div className="xl:flex flex-col items-center justify-start w-full min-h-52 p-2 gap-2 border-1 rounded-xl hidden">
            <div className="flex items-center justify-start w-full h-fit p-2 gap-2 text-2xl font-black">
              {icon} {title}
            </div>
            <div className="flex items-center justify-start w-full h-fit p-2 gap-2 opacity-80">
              {description}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 xl:grid-cols-3 place-items-center w-full h-full p-2 gap-2 border-1 rounded-xl overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
