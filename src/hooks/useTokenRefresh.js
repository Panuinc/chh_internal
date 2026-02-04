"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { createLogger } from "@/lib/shared/logger";

const logger = createLogger("useTokenRefresh");

// เวลาที่จะ refresh ก่อนหมดอายุ (5 นาที)
const REFRESH_BUFFER = 5 * 60 * 1000;

/**
 * Hook สำหรับจัดการ Token Refresh อัตโนมัติ
 * ใช้ในฝั่ง Client เพื่อตรวจสอบและ refresh token ก่อนหมดอายุ
 */
export function useTokenRefresh() {
  const { data: session, update } = useSession();
  const refreshTimeoutRef = useRef(null);

  const refreshToken = useCallback(async () => {
    try {
      logger.start({});

      if (!session?.user?.refreshToken) {
        logger.warn("No refresh token available");
        return;
      }

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: session.user.refreshToken,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to refresh token");
      }

      const data = await response.json();

      // อัปเดต session ด้วย token ใหม่
      await update({
        refreshToken: data.refreshToken,
        refreshTokenExpires: new Date(
          Date.now() + data.expiresIn * 1000
        ).toISOString(),
      });

      logger.success({});
    } catch (error) {
      logger.error({ error: error.message });
      // ถ้า refresh ไม่สำเร็จ ให้ logout
      signOut({ callbackUrl: "/signIn" });
    }
  }, [session, update]);

  useEffect(() => {
    if (!session?.user?.accessTokenExpires) return;

    const expiresAt = session.user.accessTokenExpires;
    const now = Date.now();
    const expiresIn = expiresAt - now;

    // ถ้า token หมดอายุแล้ว หรือใกล้หมดอายุ
    if (expiresIn <= REFRESH_BUFFER) {
      refreshToken();
      return;
    }

    // ตั้งเวลา refresh ก่อนหมดอายุ 5 นาที
    const timeout = setTimeout(() => {
      refreshToken();
    }, expiresIn - REFRESH_BUFFER);

    refreshTimeoutRef.current = timeout;

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [session, refreshToken]);

  return {
    refreshToken,
    isExpiringSoon: session?.user?.accessTokenExpired || false,
  };
}

export default useTokenRefresh;
