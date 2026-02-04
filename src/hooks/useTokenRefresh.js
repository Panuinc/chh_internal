"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { createLogger } from "@/lib/shared/logger";

const logger = createLogger("useTokenRefresh");

const REFRESH_BUFFER = 5 * 60 * 1000;

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

      await update({
        refreshToken: data.refreshToken,
        refreshTokenExpires: new Date(
          Date.now() + data.expiresIn * 1000,
        ).toISOString(),
      });

      logger.success({});
    } catch (error) {
      logger.error({ error: error.message });

      signOut({ callbackUrl: "/signIn" });
    }
  }, [session, update]);

  useEffect(() => {
    if (!session?.user?.accessTokenExpires) return;

    const expiresAt = session.user.accessTokenExpires;
    const now = Date.now();
    const expiresIn = expiresAt - now;

    if (expiresIn <= REFRESH_BUFFER) {
      refreshToken();
      return;
    }

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
