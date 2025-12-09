import { BellDot, Key } from "lucide-react";
import Image from "next/image";

export default function PagesLayout({ children }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      <div className="flex flex-row items-center justify-between w-full h-fit p-2 gap-2 border-b-2 border-default">
        <div className="flex items-center justify-start w-fit xl:min-w-60 h-full p-2 gap-2">
          <Image src="/logo/logo-04.png" alt="logo" width={125} height={125} />
        </div>
        <div className="xl:flex items-center justify-center w-full h-full p-2 gap-2 hidden">
          {" "}
        </div>
        <div className="xl:flex items-center justify-center w-12 xl:w-14 aspect-square p-2 gap-2 border-2 border-foreground bg-foreground/75 text-background rounded-full hidden">
          P
        </div>
        <div className="flex items-center justify-center w-12 xl:w-14 aspect-square p-2 gap-2 border-2 border-foreground bg-foreground/75 text-background rounded-full">
          <BellDot />
        </div>
        <div className="flex items-center justify-center w-12 xl:w-14 aspect-square p-2 gap-2 border-2 border-foreground bg-foreground/75 text-background rounded-full">
          <Key />
        </div>
      </div>
      <div className="flex items-center justify-center w-full h-full gap-2 overflow-hidden">
        {children}
      </div>
      <div className="flex flex-row items-center justify-center w-full h-fit p-2 gap-2 border-t-2 border-default">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          EVERGREEN BY CHH
        </div>
      </div>
    </div>
  );
}
