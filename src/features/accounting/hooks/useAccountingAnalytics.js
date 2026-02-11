"use client";

import { useState, useEffect, useCallback } from "react";

export function useAccountingAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async (signal) => {
    try {
      setLoading(true);
      const response = await fetch("/api/accounting/analytics", {
        credentials: "include",
        signal,
      });
      const result = await response.json();
      if (result.status === "success") {
        setData(result.data);
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Failed to fetch Accounting analytics:", err);
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
