"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import showToast from "@/components/UIToast";

const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
  WARNING: "warning",
};

function getErrorMessage(error) {
  if (typeof error === "string") return error;
  return error?.message || "Unknown error";
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

export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn(controller.signal);
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err);
        showToast(TOAST.DANGER, `Error: ${getErrorMessage(err)}`);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, setData };
}

export function createUseList(apiUrl, dataKey, formatFn = (item) => item) {
  return function useList(customUrl = null) {
    const url = customUrl || apiUrl;

    const { data, loading, error } = useFetch(
      async (signal) => {
        const result = await fetchWithAbort(url, {}, signal);
        const items = result[dataKey];

        return Array.isArray(items)
          ? items.map((item, i) => formatFn(item, i)).filter(Boolean)
          : [];
      },
      [url]
    );

    return {
      items: data || [],
      loading,
      error,
    };
  };
}

export function createUseItem(apiUrl, dataKey, formatFn = (item) => item) {
  return function useItem(id) {
    const { data, loading, error } = useFetch(
      async (signal) => {
        if (!id) return null;

        const result = await fetchWithAbort(`${apiUrl}/${id}`, {}, signal);

        if (!result[dataKey]) {
          showToast(TOAST.WARNING, "No data found.");
          return null;
        }

        return formatFn(result[dataKey]);
      },
      [id]
    );

    return {
      item: data,
      loading,
      error,
    };
  };
}

export function createUseSubmit(apiUrl, defaultOptions = {}) {
  return function useSubmit(options = {}) {
    const {
      mode = "create",
      itemId = null,
      currentUserId,
      createdByField = "createdBy",
      updatedByField = "updatedBy",
      onSuccess = null,
      redirectPath = null,
      redirectDelay = 1500,
    } = { ...defaultOptions, ...options };

    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const submit = useCallback(
      async (formData, setErrors = () => {}) => {
        setSubmitting(true);

        const isCreate = mode === "create";
        const byField = isCreate ? createdByField : updatedByField;

        const payload = {
          ...formData,
          [byField]: currentUserId,
        };

        const url = isCreate ? apiUrl : `${apiUrl}/${itemId}`;
        const method = isCreate ? "POST" : "PUT";

        try {
          const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          });

          const result = await response.json().catch(() => ({}));

          if (response.ok) {
            showToast(TOAST.SUCCESS, result.message || "Success");

            if (onSuccess) {
              onSuccess(result);
            }

            if (redirectPath) {
              setTimeout(() => router.push(redirectPath), redirectDelay);
            }
          } else {
            if (result.details && typeof result.details === "object") {
              setErrors(result.details);
            } else {
              setErrors({});
            }

            showToast(TOAST.DANGER, result.error || "Failed to submit.");
          }
        } catch (err) {
          showToast(TOAST.DANGER, `Failed: ${getErrorMessage(err)}`);
        } finally {
          setSubmitting(false);
        }
      },
      [
        mode,
        itemId,
        currentUserId,
        router,
        onSuccess,
        redirectPath,
        redirectDelay,
        createdByField,
        updatedByField,
      ]
    );

    return { submit, submitting };
  };
}
