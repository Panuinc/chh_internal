"use client";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { SessionProvider } from "next-auth/react";

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <HeroUIProvider>
        <ToastProvider
          placement="top-right"
          toastOffset={0}
          maxVisibleToasts={4}
        />
        {children}
      </HeroUIProvider>
    </SessionProvider>
  );
}
