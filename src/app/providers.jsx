"use client";

import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { SessionProvider } from "next-auth/react";
import { TokenRefreshProvider } from "@/components";

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <TokenRefreshProvider>
        <HeroUIProvider>
          <ToastProvider
            placement="top-right"
            toastOffset={0}
            maxVisibleToasts={4}
          />
          {children}
        </HeroUIProvider>
      </TokenRefreshProvider>
    </SessionProvider>
  );
}
