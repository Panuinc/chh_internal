"use client";

import { useState, useEffect, useCallback } from "react";

export function useSalesAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async (signal) => {
    try {
      setLoading(true);
      const response = await fetch("/api/sales/analytics", {
        credentials: "include",
        signal,
      });
      const result = await response.json();
      if (result.status === "success") {
        setData(result.data);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Failed to fetch Sales analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchAnalytics(controller.signal);
    return () => controller.abort();
  }, [fetchAnalytics]);

  return { data, loading };
}
