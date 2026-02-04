// Validate environment variables on server startup
if (typeof window === "undefined") {
  require("@/lib/env");
}

import { Montserrat, Noto_Sans_Thai as notoSansThai } from "next/font/google";
import "@/style/globals.css";
import { Providers } from "./providers";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-en",
  weight: ["400"],
  display: "swap",
});

const notoThai = notoSansThai({
  subsets: ["thai"],
  variable: "--font-th",
  weight: ["400"],
  display: "swap",
});

export const metadata = {
  title: "EverGreen Internal",
  description: "EverGreen Internal System By CHH",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo/logo-01.png" />
      </head>
      <body
        className={`
          ${montserrat.variable} 
          ${notoThai.variable} 
          font-system
          antialiased
        `}
      >
        <Providers>
          <div className="flex items-center justify-center w-full h-screen gap-2 bg-background text-foreground text-xs">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
