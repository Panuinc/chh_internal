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

// Status labels in Thai
const STATUS_LABELS = {
  DRAFT: "ร่าง",
  PENDING_SALES_MANAGER: "รอผู้จัดการฝ่ายขายอนุมัติ",
  PENDING_CEO: "รอกรรมการผู้จัดการอนุมัติ",
  APPROVED: "อนุมัติแล้ว",
  REJECTED: "ปฏิเสธ",
};

// Status colors
const STATUS_COLORS = {
  DRAFT: "default",
  PENDING_SALES_MANAGER: "warning",
  PENDING_CEO: "warning",
  APPROVED: "success",
  REJECTED: "danger",
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
    memoSalesManagerName: memo.memoSalesManagerName || getFullName(memo.salesManagerEmployee),
    memoCeoName: memo.memoCeoName || getFullName(memo.ceoEmployee),
    memoRejectedByName: memo.memoRejectedByName || getFullName(memo.rejectedByEmployee),
    memoStatusLabel: STATUS_LABELS[memo.memoStatus] || memo.memoStatus,
    memoStatusColor: STATUS_COLORS[memo.memoStatus] || "default",
    memoDateFormatted: memo.memoDate
      ? new Date(memo.memoDate).toLocaleDateString("th-TH")
      : "-",
    memoCreatedAtFormatted: memo.memoCreatedAt
      ? new Date(memo.memoCreatedAt).toLocaleString("th-TH")
      : "-",
    memoSalesManagerDateFormatted: memo.memoSalesManagerDate
      ? new Date(memo.memoSalesManagerDate).toLocaleDateString("th-TH")
      : null,
    memoCeoDateFormatted: memo.memoCeoDate
      ? new Date(memo.memoCeoDate).toLocaleDateString("th-TH")
      : null,
    memoRejectedAtFormatted: memo.memoRejectedAt
      ? new Date(memo.memoRejectedAt).toLocaleString("th-TH")
      : null,
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

  const fetchMemos = useCallback(async (signal) => {
    try {
      const result = await fetchWithAbort(apiUrl, {}, signal);

      const items = result.memos || result.data || [];

      const formatted = Array.isArray(items)
        ? items.map((p, i) => formatMemo(p, i)).filter(Boolean)
        : [];

      setMemos(formatted);
    } catch (err) {
      if (err.name === "AbortError") return;
      showToast(TOAST.DANGER, `Error: ${getErrorMessage(err)}`);
    }
  }, [apiUrl]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      await fetchMemos(controller.signal);
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [fetchMemos]);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchMemos();
    setLoading(false);
  }, [fetchMemos]);

  return { memos, loading, refetch };
}

export function useMemoItem(memoId) {
  const [memo, setMemo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMemo = useCallback(async (signal) => {
    if (!memoId) {
      setLoading(false);
      return;
    }

    try {
      const result = await fetchWithAbort(
        `${API_URL}/${memoId}`,
        {},
        signal
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
    }
  }, [memoId]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      await fetchMemo(controller.signal);
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [fetchMemo]);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchMemo();
    setLoading(false);
  }, [fetchMemo]);

  return { memo, loading, refetch };
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

export function useApproveMemo() {
  return useCallback(async (memoId) => {
    try {
      const response = await fetch(`${API_URL}/${memoId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}), // Send empty body
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        showToast(TOAST.SUCCESS, result.message || "Approved successfully");
        return { success: true, data: result };
      } else {
        showToast(
          TOAST.DANGER,
          result.error || "Failed to approve Memo."
        );
        return { success: false, error: result.error };
      }
    } catch (err) {
      showToast(
        TOAST.DANGER,
        `Failed to approve Memo: ${getErrorMessage(err)}`
      );
      return { success: false, error: err.message };
    }
  }, []);
}

export function useRejectMemo() {
  return useCallback(async (memoId, reason) => {
    try {
      const response = await fetch(`${API_URL}/${memoId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        showToast(TOAST.SUCCESS, result.message || "Rejected successfully");
        return { success: true, data: result };
      } else {
        showToast(
          TOAST.DANGER,
          result.error || "Failed to reject Memo."
        );
        return { success: false, error: result.error };
      }
    } catch (err) {
      showToast(
        TOAST.DANGER,
        `Failed to reject Memo: ${getErrorMessage(err)}`
      );
      return { success: false, error: err.message };
    }
  }, []);
}
