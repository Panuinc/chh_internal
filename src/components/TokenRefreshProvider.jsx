"use client";

import { useTokenRefresh } from "@/hooks/useTokenRefresh";

export function TokenRefreshProvider({ children }) {
  useTokenRefresh();

  return children;
}

export default TokenRefreshProvider;
