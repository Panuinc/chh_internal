import { BellDot, Key } from "lucide-react";
import Image from "next/image";

export default function PagesLayout({ children }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      <header className="flex flex-row items-center justify-between w-full h-fit p-2 gap-2 bg-foreground">
        <div className="flex items-center justify-start w-fit xl:min-w-60 h-full p-2 gap-2">
          <Image src="/logo/logo-08.png" alt="logo" width={125} height={125} />
        </div>
        <div className="xl:flex items-center justify-center w-full h-full p-2 gap-2 hidden">
          {" "}
        </div>
        <div className="xl:flex items-center justify-center w-12 xl:w-14 aspect-square p-2 gap-2 bg-background text-foreground rounded-full hidden font-semibold">
          P
        </div>
        <div className="flex items-center justify-center w-12 xl:w-14 aspect-square p-2 gap-2 bg-background text-foreground rounded-full cursor-pointer hover:opacity-80 transition-opacity">
          <BellDot />
        </div>
        <div className="flex items-center justify-center w-12 xl:w-14 aspect-square p-2 gap-2 bg-background text-foreground rounded-full cursor-pointer hover:opacity-80 transition-opacity">
          <Key />
        </div>
      </header>
      <main className="flex items-center justify-center w-full h-full gap-2 overflow-hidden">
        {children}
      </main>
      <footer className="flex flex-row items-center justify-center w-full h-fit p-2 gap-2 bg-foreground">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2 text-background">
          EVERGREEN BY CHH
        </div>
      </footer>
    </div>
  );
}
