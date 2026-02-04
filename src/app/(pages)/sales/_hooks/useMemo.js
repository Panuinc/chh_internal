"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import showToast from "@/components/UIToast";

const API_URL = "/api/sales/memo";

const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
  WARNING: "warning",
};

function formatMemo(memo, index = null) {
  if (!memo) return null;

  const getFullName = (employee) =>
    employee
      ? `${employee.employeeFirstName} ${employee.employeeLastName}`
      : "-";

  return {
    ...memo,
    ...(index !== null && { memoIndex: index + 1 }),
    memoCreatedBy: getFullName(memo.createdByEmployee),
    memoUpdatedBy: getFullName(memo.updatedByEmployee),
    memoDateFormatted: memo.memoDate
      ? new Date(memo.memoDate).toLocaleDateString("th-TH")
      : "-",
    memoCreatedAtFormatted: memo.memoCreatedAt
      ? new Date(memo.memoCreatedAt).toLocaleString("th-TH")
      : "-",
  };
}

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

export function useMemos(apiUrl = API_URL) {
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const result = await fetchWithAbort(apiUrl, {}, controller.signal);

        const items = result.memos || result.data || [];

        const formatted = Array.isArray(items)
          ? items.map((p, i) => formatMemo(p, i)).filter(Boolean)
          : [];

        setMemos(formatted);
      } catch (err) {
        if (err.name === "AbortError") return;
        showToast(TOAST.DANGER, `Error: ${getErrorMessage(err)}`);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [apiUrl]);

  return { memos, loading };
}

export function useMemo(memoId) {
  const [memo, setMemo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!memoId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const result = await fetchWithAbort(
          `${API_URL}/${memoId}`,
          {},
          controller.signal
        );

        const item = result.memo || result.data;

        if (!item) {
          showToast(TOAST.WARNING, "No Memo data found.");
          return;
        }

        setMemo(formatMemo(item));
      } catch (err) {
        if (err.name === "AbortError") return;
        showToast(TOAST.DANGER, `Error: ${getErrorMessage(err)}`);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [memoId]);

  return { memo, loading };
}

export function useNextDocumentNo() {
  const [documentNo, setDocumentNo] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const result = await fetchWithAbort(
          `${API_URL}/next-document-no`,
          {},
          controller.signal
        );
        setDocumentNo(result.documentNo || "");
      } catch (err) {
        if (err.name === "AbortError") return;
        showToast(TOAST.DANGER, `Error: ${getErrorMessage(err)}`);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, []);

  return { documentNo, loading };
}

export function useSubmitMemo({
  mode = "create",
  memoId = null,
  currentEmployeeId,
}) {
  const router = useRouter();

  return useCallback(
    async (formRefOrData, formDataOrSetErrors, setErrorsOptional) => {
      let formData, setErrors;

      if (setErrorsOptional !== undefined) {
        formData = formDataOrSetErrors;
        setErrors = setErrorsOptional;
      } else {
        formData = formRefOrData;
        setErrors = formDataOrSetErrors || (() => {});
      }

      const isCreate = mode === "create";
      const byField = isCreate ? "createdBy" : "updatedBy";

      const payload = {
        ...formData,
        [byField]: currentEmployeeId,
      };

      const url = isCreate ? API_URL : `${API_URL}/${memoId}`;
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
          setTimeout(() => router.push("/sales/memo"), 1500);
        } else {
          if (result.details && typeof result.details === "object") {
            setErrors(result.details);
          } else {
            setErrors({});
          }

          showToast(
            TOAST.DANGER,
            result.error || "Failed to submit Memo."
          );
        }
      } catch (err) {
        showToast(
          TOAST.DANGER,
          `Failed to submit Memo: ${getErrorMessage(err)}`
        );
      }
    },
    [mode, memoId, currentEmployeeId, router]
  );
}

export function useDeleteMemo() {
  return useCallback(async (memoId) => {
    try {
      const response = await fetch(`${API_URL}/${memoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        showToast(TOAST.SUCCESS, result.message || "Deleted successfully");
        return true;
      } else {
        showToast(
          TOAST.DANGER,
          result.error || "Failed to delete Memo."
        );
        return false;
      }
    } catch (err) {
      showToast(
        TOAST.DANGER,
        `Failed to delete Memo: ${getErrorMessage(err)}`
      );
      return false;
    }
  }, []);
}
