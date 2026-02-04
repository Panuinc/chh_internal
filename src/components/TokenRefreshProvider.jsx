"use client";

import { useTokenRefresh } from "@/hooks/useTokenRefresh";

/**
 * Provider สำหรับจัดการ Token Refresh อัตโนมัติ
 * ควรใส่ไว้ภายใน SessionProvider
 */
export function TokenRefreshProvider({ children }) {
  // Hook นี้จะจัดการการ refresh token อัตโนมัติ
  useTokenRefresh();

  return children;
}

export default TokenRefreshProvider;
