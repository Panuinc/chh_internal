"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = "/api/bc/sales-invoices";

function getErrorMessage(error) {
  if (typeof error === "string") return error;
  return error?.message || "Unknown error";
}

function extractInvoices(result) {
  if (Array.isArray(result)) return result;
  if (result?.data?.salesInvoices) return result.data.salesInvoices;
  if (result?.data && Array.isArray(result.data)) return result.data;
  if (result?.salesInvoices) return result.salesInvoices;
  return [];
}

function extractInvoice(result) {
  if (result?.data?.salesInvoice) return result.data.salesInvoice;
  if (result?.data && !Array.isArray(result.data)) return result.data;
  if (result?.salesInvoice) return result.salesInvoice;
  return result;
}

async function fetchWithAbort(url, options, signal) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    signal,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export function useSalesInvoices(params = {}) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({});

  const fetchData = useCallback(
    async (signal) => {
      try {
        setError(null);
        setLoading(true);

        const searchParams = new URLSearchParams();
        if (params.displayName)
          searchParams.set("displayName", params.displayName);
        if (params.numberPrefix)
          searchParams.set("numberPrefix", params.numberPrefix);
        if (params.includeLines !== undefined)
          searchParams.set("includeLines", String(params.includeLines));
        if (params.limit) searchParams.set("limit", String(params.limit));

        const queryString = searchParams.toString();
        const url = `${API_URL}${queryString ? `?${queryString}` : ""}`;

        const result = await fetchWithAbort(url, {}, signal);

        if (result.success) {
          const items = extractInvoices(result);
          setInvoices(items);
          setMeta(result.meta || {});
        } else {
          throw new Error(result.error || "Failed to fetch invoices");
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error fetching invoices:", err);
        setError(err.message);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    },
    [params.displayName, params.numberPrefix, params.includeLines, params.limit]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    return fetchData(controller.signal);
  }, [fetchData]);

  return { invoices, loading, error, meta, refetch };
}

export function useSalesInvoice(invoiceId) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (signal) => {
      if (!invoiceId) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);

        const result = await fetchWithAbort(
          `${API_URL}/${invoiceId}`,
          {},
          signal
        );

        if (result.success) {
          const item = extractInvoice(result);
          setInvoice(item);
        } else {
          throw new Error(result.error || "Failed to fetch invoice");
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error fetching invoice:", err);
        setError(err.message);
        setInvoice(null);
      } finally {
        setLoading(false);
      }
    },
    [invoiceId]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    return fetchData(controller.signal);
  }, [fetchData]);

  return { invoice, loading, error, refetch };
}
