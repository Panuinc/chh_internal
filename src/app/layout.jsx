if (typeof window === "undefined") {
  require("@/lib/env");
}

import { Inter, Noto_Sans_Thai as notoSansThai } from "next/font/google";
import "@/style/globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-en",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoThai = notoSansThai({
  subsets: ["thai"],
  variable: "--font-th",
  weight: ["300", "400", "500", "600", "700"],
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
          ${inter.variable}
          ${notoThai.variable}
          font-system
          antialiased
        `}
      >
        <Providers>
          <div className="flex w-full h-screen bg-default text-foreground text-sm">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
