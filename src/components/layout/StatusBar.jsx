"use client";
import { usePathname } from "next/navigation";
import { Circle, Monitor } from "lucide-react";

export default function StatusBar() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const currentModule = segments[0] || "home";

  return (
    <footer className="hidden xl:flex items-center justify-between h-7 p-2 bg-default-50 border-t border-default shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-default-400 font-medium">
          EverGreen Internal v1.0
        </span>
        <div className="w-px h-3 bg-default-300" />
        <div className="flex items-center gap-2">
          <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" />
          <span className="text-[10px] text-default-400">Connected</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Monitor className="w-3 h-3 text-default-400" strokeWidth={1.5} />
          <span className="text-[10px] text-default-400 capitalize">
            {currentModule}
          </span>
        </div>
        <div className="w-px h-3 bg-default-300" />
        <span className="p-2 text-[9px] font-medium bg-amber-50 text-amber-600 rounded select-none">
          DEV
        </span>
      </div>
    </footer>
  );
}
