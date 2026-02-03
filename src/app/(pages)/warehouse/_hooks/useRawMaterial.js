"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = "/api/warehouse/rawMaterial";

function extractItems(result) {
  if (Array.isArray(result)) return result;
  if (result?.data?.rawMaterialItems) return result.data.rawMaterialItems;
  if (result?.data && Array.isArray(result.data)) return result.data;
  if (result?.rawMaterialItems) return result.rawMaterialItems;
  return [];
}

function extractItem(result) {
  if (result?.data?.rawMaterialItem) return result.data.rawMaterialItem;
  if (result?.data && !Array.isArray(result.data)) return result.data;
  if (result?.rawMaterialItem) return result.rawMaterialItem;
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

export function useRawMaterialItems(params = {}) {
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
        console.error("Error fetching cat packing items:", err);
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

export function useRawMaterialItem(itemId) {
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
        console.error("Error fetching cat packing item:", err);
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
  useRawMaterialItems,
  useRawMaterialItem,
};
