"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import UISalesOrderDetail from "@/module/sales/salesOrderOnline/UISalesOrderDetail";

function extractOrder(result) {
  if (result?.data?.salesOrder) return result.data.salesOrder;
  if (result?.data && !Array.isArray(result.data)) return result.data;
  if (result?.salesOrder) return result.salesOrder;
  return result;
}

export default function SalesOrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!params.id) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`/api/sales/salesOrderOnline/${params.id}`, {
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to fetch order",
        );
      }

      if (result.success === false) {
        throw new Error(result.error || "Failed to fetch order");
      }

      const orderData = extractOrder(result);
      setOrder(orderData);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return (
    <UISalesOrderDetail
      order={order}
      loading={loading}
      error={error}
      onRefresh={fetchOrder}
    />
  );
}
