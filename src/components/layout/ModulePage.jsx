"use client";
import React from "react";

export default function ModulePage({
  icon,
  title,
  description = "Your tools. Your workflow. Your operations.",
  sidebar,
  children,
  analytics,
  showHeader = true,
  showSidebar = true,
}) {
  return (
    <div className="flex flex-col w-full h-full overflow-auto">
      <div className="w-full h-full p-2">
        {showHeader && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
              {icon} {title}
            </div>
            <p className="text-[13px] text-default-400">
              {description}
            </p>
          </div>
        )}

        {analytics && <div className="w-full">{analytics}</div>}

        <div className="flex flex-col xl:flex-row gap-2">
          {showSidebar && sidebar && (
            <div className="xl:w-56 shrink-0">
              {sidebar}
            </div>
          )}

          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
