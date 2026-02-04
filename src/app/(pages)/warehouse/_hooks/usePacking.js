"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = "/api/warehouse/packing";

function extractItems(result) {
  if (Array.isArray(result)) return result;
  if (result?.data?.catPackingItems) return result.data.catPackingItems;
  if (result?.data && Array.isArray(result.data)) return result.data;
  if (result?.catPackingItems) return result.catPackingItems;
  return [];
}

function extractItem(result) {
  if (result?.data?.catPackingItem) return result.data.catPackingItem;
  if (result?.data && !Array.isArray(result.data)) return result.data;
  if (result?.catPackingItem) return result.catPackingItem;
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

export function usePackingItems(params = {}) {
  const [items, setItems] = useState([]);
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
        if (params.number) searchParams.set("number", params.number);
        if (params.description)
          searchParams.set("description", params.description);
        if (params.limit) searchParams.set("limit", String(params.limit));

        const queryString = searchParams.toString();
        const url = `${API_URL}${queryString ? `?${queryString}` : ""}`;

        const result = await fetchWithAbort(url, {}, signal);

        if (result.success) {
          const data = extractItems(result);
          setItems(data);
          setMeta(result.meta || {});
        } else {
          throw new Error(result.error || "Failed to fetch items");
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message);
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [params.displayName, params.number, params.description, params.limit]
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

  return { items, loading, error, meta, refetch };
}

export function usePackingItem(itemId) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (signal) => {
      if (!itemId) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);

        const result = await fetchWithAbort(`${API_URL}/${itemId}`, {}, signal);

        if (result.success) {
          const data = extractItem(result);
          setItem(data);
        } else {
          throw new Error(result.error || "Failed to fetch item");
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message);
        setItem(null);
      } finally {
        setLoading(false);
      }
    },
    [itemId]
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

  return { item, loading, error, refetch };
}

export default {
  usePackingItems,
  usePackingItem,
};
