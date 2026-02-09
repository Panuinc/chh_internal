"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

export function useChangePassword() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!session?.user?.accountId) {
        setError("User session not found");
        return { success: false, error: "User session not found" };
      }

      setIsLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await fetch(
          `/api/hr/account/${session.user.accountId}/change-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              currentPassword,
              newPassword,
              accountUpdatedBy: session.user.id,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to change password");
        }

        setSuccess(true);
        return { success: true, data };
      } catch (err) {
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [session]
  );

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    changePassword,
    isLoading,
    error,
    success,
    resetState,
  };
}

export default useChangePassword;
