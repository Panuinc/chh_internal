"use client";

import { useState, useCallback } from "react";

export function useCheckTagEMS() {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchEMS = useCallback(async (barcode) => {
    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const response = await fetch("/api/accounting/ems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ barcode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch tracking data (${response.status})`);
      }

      if (data.success) {
        setTrackingData(data.data);
      } else {
        throw new Error(data.error || "No tracking data found");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Error fetching EMS tracking data:", errorMessage);
      setError(errorMessage || "An error occurred while fetching tracking data");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearTrackingData = useCallback(() => {
    setTrackingData(null);
    setError(null);
  }, []);

  return {
    trackingData,
    loading,
    error,
    searchEMS,
    clearTrackingData,
  };
}
