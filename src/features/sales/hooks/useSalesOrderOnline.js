"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

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

const FG_API_URL = "/api/warehouse/finishedGoods";
const DIMENSION_API_URL = "/api/warehouse/dimensionValues";
const ONLINE_PROJECT_NAME = "CHH - Online";

function extractFGItems(result) {
  if (result?.data?.catFinishedGoodsItems)
    return result.data.catFinishedGoodsItems;
  if (result?.data && Array.isArray(result.data)) return result.data;
  if (result?.catFinishedGoodsItems) return result.catFinishedGoodsItems;
  if (Array.isArray(result)) return result;
  return [];
}

function extractProjectCode(itemNumber) {
  if (!itemNumber) return null;
  const parts = itemNumber.split("-");
  if (parts.length >= 3 && parts[0] === "FG") return parts[1];
  return null;
}

export function useFGStockOnline() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (signal) => {
    try {
      setError(null);
      setLoading(true);

      const fgResult = await fetchWithAbort(
        `${FG_API_URL}?includeZeroInventory=true&limit=500`,
        {},
        signal,
      );

      if (fgResult.success === false) {
        throw new Error(fgResult.error || "Failed to fetch FG items");
      }

      const allItems = extractFGItems(fgResult);

      const projectCodes = new Set();
      allItems.forEach((item) => {
        const code = extractProjectCode(item.number);
        if (code) projectCodes.add(code);
      });

      if (projectCodes.size === 0) {
        setItems([]);
        return;
      }

      const dimResult = await fetchWithAbort(
        `${DIMENSION_API_URL}?codes=${Array.from(projectCodes).join(",")}&dimensionCode=PROJECT`,
        {},
        signal,
      );

      let onlineProjectCode = null;
      if (dimResult.success && dimResult.data) {
        const onlineProject = dimResult.data.find(
          (d) =>
            d.displayName === ONLINE_PROJECT_NAME ||
            d.displayName?.toLowerCase().includes("online"),
        );
        if (onlineProject) {
          onlineProjectCode = onlineProject.code;
        }
      }

      if (!onlineProjectCode) {
        setItems([]);
        return;
      }

      const onlineItems = allItems
        .filter((item) => extractProjectCode(item.number) === onlineProjectCode)
        .map((item) => ({
          ...item,
          projectCode: onlineProjectCode,
          projectName: ONLINE_PROJECT_NAME,
          productCode: item.number?.split("-").slice(2).join("-") || "",
        }))
        .sort((a, b) => (b.inventory || 0) - (a.inventory || 0));

      setItems(onlineItems);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    return fetchData(controller.signal);
  }, [fetchData]);

  return { items, loading, error, refetch };
}

const CHANNEL_MAP = {
  L: { label: "Line", color: "#06C755" },
  FB: { label: "Facebook", color: "#1877F2" },
  IN: { label: "Instagram", color: "#E4405F" },
  SP: { label: "Shopee", color: "#EE4D2D" },
  TT: { label: "TikTok", color: "#010101" },
  LZ: { label: "Lazada", color: "#0F146D" },
  W: { label: "Website", color: "#9353D3" },
};

const GROUP_MAP = {
  CLT: "ลูกค้าทั่วไป",
  OWN: "เจ้าของโครงการ",
  DEV: "Developer",
  MC: "ผู้รับเหมาหลัก",
  SUB: "ผู้รับเหมาช่วง",
  ARCH: "สถาปนิก",
  PM: "ที่ปรึกษาโครงการ",
};

const TYPE_MAP = {
  RES: "ที่อยู่อาศัย",
  COM: "อาคารพาณิชย์",
  IND: "อุตสาหกรรม",
  INFRA: "สาธารณูปโภค",
};

export function parseContactCode(contact) {
  if (!contact) return { channelCode: null, groupCode: null, typeCode: null };

  const parts = contact.split("-").map((p) => p.trim().toUpperCase());
  const channelCode = parts[0] || null;
  const groupCode = parts[1] || null;
  const typeCode = parts[2] || null;

  return {
    channelCode,
    channelLabel: CHANNEL_MAP[channelCode]?.label || channelCode || "Other",
    channelColor: CHANNEL_MAP[channelCode]?.color || "#71717A",
    groupCode,
    groupLabel: GROUP_MAP[groupCode] || groupCode || "Other",
    typeCode,
    typeLabel: TYPE_MAP[typeCode] || typeCode || "Other",
  };
}

const CUSTOMERS_API_URL = "/api/sales/customers";

export function useCustomersOnline() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (signal) => {
    try {
      setError(null);
      setLoading(true);

      const result = await fetchWithAbort(CUSTOMERS_API_URL, {}, signal);

      if (result.success === false) {
        throw new Error(result.error || "Failed to fetch customers");
      }

      const data = result.data || [];
      const enriched = data.map((c) => ({
        ...c,
        parsed: parseContactCode(c.contact),
      }));

      setCustomers(enriched);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const customerMap = useMemo(() => {
    const map = {};
    customers.forEach((c) => {
      map[c.no] = c;
    });
    return map;
  }, [customers]);

  return { customers, customerMap, loading, error };
}

const salesOrderOnlineHooks = {
  useSalesOrdersOnline,
  useSalesOrderOnline,
  useFGStockOnline,
  useCustomersOnline,
};

export default salesOrderOnlineHooks;
