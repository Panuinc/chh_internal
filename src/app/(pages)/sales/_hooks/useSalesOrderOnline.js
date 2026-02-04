"use client";

import { useState, useEffect, useCallback } from "react";

const API_URL = "/api/sales/salesOrderOnline";

function extractOrders(result) {
  if (Array.isArray(result)) return result;
  if (result?.data?.salesOrders) return result.data.salesOrders;
  if (result?.data && Array.isArray(result.data)) return result.data;
  if (result?.salesOrders) return result.salesOrders;
  return [];
}

function extractOrder(result) {
  if (result?.data?.salesOrder) return result.data.salesOrder;
  if (result?.data && !Array.isArray(result.data)) return result.data;
  if (result?.salesOrder) return result.salesOrder;
  return result;
}

async function fetchWithAbort(url, options, signal) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    signal,
  });

  let data;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = {};
  }

  if (!response.ok) {
    const errorMessage =
      data?.error ||
      data?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export function useSalesOrdersOnline(params = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({});

  const fetchData = useCallback(
    async (signal) => {
      try {
        setError(null);
        setLoading(true);

        const searchParams = new URLSearchParams();
        if (params.number) searchParams.set("number", params.number);
        if (params.customerNumber)
          searchParams.set("customerNumber", params.customerNumber);
        if (params.customerName)
          searchParams.set("customerName", params.customerName);
        if (params.status) searchParams.set("status", params.status);
        if (params.orderDateFrom)
          searchParams.set("orderDateFrom", params.orderDateFrom);
        if (params.orderDateTo)
          searchParams.set("orderDateTo", params.orderDateTo);
        if (params.limit) searchParams.set("limit", String(params.limit));

        const queryString = searchParams.toString();
        const url = `${API_URL}${queryString ? `?${queryString}` : ""}`;

        const result = await fetchWithAbort(url, {}, signal);

        if (result.success === false) {
          throw new Error(result.error || "Failed to fetch sales orders");
        }

        const data = extractOrders(result);
        setOrders(data);
        setMeta(result.meta || { total: data.length });
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [
      params.number,
      params.customerNumber,
      params.customerName,
      params.status,
      params.orderDateFrom,
      params.orderDateTo,
      params.limit,
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

  return { orders, loading, error, meta, refetch };
}

export function useSalesOrderOnline(orderId) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(
    async (signal) => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);

        const result = await fetchWithAbort(
          `${API_URL}/${orderId}`,
          {},
          signal,
        );

        if (result.success === false) {
          throw new Error(result.error || "Failed to fetch sales order");
        }

        const data = extractOrder(result);
        setOrder(data);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    },
    [orderId],
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

  return { order, loading, error, refetch };
}

const salesOrderOnlineHooks = {
  useSalesOrdersOnline,
  useSalesOrderOnline,
};

export default salesOrderOnlineHooks;
