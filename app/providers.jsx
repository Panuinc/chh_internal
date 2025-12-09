"use client";

import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";

export function Providers({ children }) {
  return (
    <HeroUIProvider>
      <ToastProvider
        placement="top-right"
        toastOffset={0}
        maxVisibleToasts={4}
      />
      {children}
    </HeroUIProvider>
  );
}
