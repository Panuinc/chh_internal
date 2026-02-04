"use client";

import { useState, useCallback, useEffect } from "react";

export function useMemos({ limit = 100, offset = 0 } = {}) {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchMemos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/sales/memo?limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error("Failed to fetch memos");
      }
      const data = await response.json();
      setMemos(data.data || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    fetchMemos();
  }, [fetchMemos]);

  const createMemo = useCallback(async (memoData) => {
    try {
      const response = await fetch("/api/sales/memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memoData),
      });
      if (!response.ok) {
        throw new Error("Failed to create memo");
      }
      await fetchMemos();
      return await response.json();
    } catch (err) {
      throw err;
    }
  }, [fetchMemos]);

  const updateMemo = useCallback(async (id, memoData) => {
    try {
      const response = await fetch(`/api/sales/memo/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memoData),
      });
      if (!response.ok) {
        throw new Error("Failed to update memo");
      }
      await fetchMemos();
      return await response.json();
    } catch (err) {
      throw err;
    }
  }, [fetchMemos]);

  const deleteMemo = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/sales/memo/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete memo");
      }
      await fetchMemos();
    } catch (err) {
      throw err;
    }
  }, [fetchMemos]);

  return {
    memos,
    loading,
    error,
    pagination,
    refetch: fetchMemos,
    createMemo,
    updateMemo,
    deleteMemo,
  };
}

export function useMemo(id) {
  const [memo, setMemo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMemo = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/sales/memo/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch memo");
      }
      const data = await response.json();
      setMemo(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMemo();
  }, [fetchMemo]);

  return { memo, loading, error, refetch: fetchMemo };
}
