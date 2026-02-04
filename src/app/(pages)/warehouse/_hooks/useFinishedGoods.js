"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = "/api/warehouse/finishedGoods";

export function extractDimensionCodes(itemNumber) {
  if (!itemNumber) return { projectCode: null, productCode: null };

  const parts = itemNumber.split("-");

  if (parts.length >= 3) {
    return {
      projectCode: parts[0] || null,
      productCode: parts.slice(2).join("-") || null,
    };
  } else if (parts.length === 2) {
    return {
      projectCode: parts[0] || null,
      productCode: parts[1] || null,
    };
  }

  return { projectCode: null, productCode: null };
}

function extractItems(result) {
  if (Array.isArray(result)) return result;
  if (result?.data?.catFinishedGoodsItems)
    return result.data.catFinishedGoodsItems;
  if (result?.data && Array.isArray(result.data)) return result.data;
  if (result?.catFinishedGoodsItems) return result.catFinishedGoodsItems;
  return [];
}

function extractItem(result) {
  if (result?.data?.catFinishedGoodsItem)
    return result.data.catFinishedGoodsItem;
  if (result?.data && !Array.isArray(result.data)) return result.data;
  if (result?.catFinishedGoodsItem) return result.catFinishedGoodsItem;
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
      data.error || `Request failed with status ${response.status}`,
    );
  }

  return data;
}

export function useFinishedGoodsItems(params = {}) {
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
        if (params.includeZeroInventory)
          searchParams.set("includeZeroInventory", "true");

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
    [
      params.displayName,
      params.number,
      params.description,
      params.limit,
      params.includeZeroInventory,
    ],
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

export function useFinishedGoodsItem(itemId) {
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
    [itemId],
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

const finishedGoodsHooks = {
  useFinishedGoodsItems,
  useFinishedGoodsItem,
  extractDimensionCodes,
};

export default finishedGoodsHooks;
