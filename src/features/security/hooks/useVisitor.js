"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/Toast";

const API_URL = "/api/security/visitor";

const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
  WARNING: "warning",
};

function formatVisitor(visitor, index = null) {
  if (!visitor) return null;

  const getFullName = (employee) =>
    employee
      ? `${employee.employeeFirstName} ${employee.employeeLastName}`
      : "-";

  return {
    ...visitor,
    ...(index !== null && { visitorIndex: index + 1 }),
    visitorFullName: `${visitor.visitorFirstName} ${visitor.visitorLastName}`,
    visitorContactUserName: getFullName(visitor.contactUser),
    visitorCreatedByName: getFullName(visitor.createdByEmployee),
    visitorUpdatedByName: getFullName(visitor.updatedByEmployee),
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

export function useVisitors(apiUrl = API_URL) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVisitors = useCallback(
    async (signal) => {
      try {
        const result = await fetchWithAbort(apiUrl, {}, signal);

        const items = result.visitors || result.data || [];

        const formatted = Array.isArray(items)
          ? items.map((p, i) => formatVisitor(p, i)).filter(Boolean)
          : [];

        setVisitors(formatted);
      } catch (err) {
        if (err.name === "AbortError") return;
        showToast(TOAST.DANGER, `Error: ${getErrorMessage(err)}`);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [apiUrl]
  );

  const refetch = useCallback(() => {
    setLoading(true);
    const controller = new AbortController();
    fetchVisitors(controller.signal);
    return () => controller.abort();
  }, [fetchVisitors]);

  useEffect(() => {
    const controller = new AbortController();
    fetchVisitors(controller.signal);
    return () => controller.abort();
  }, [fetchVisitors]);

  return { visitors, loading, refetch, setVisitors };
}

export function useVisitor(visitorId) {
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visitorId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const result = await fetchWithAbort(
          `${API_URL}/${visitorId}`,
          {},
          controller.signal
        );

        const item = result.visitor || result.data;

        if (!item) {
          showToast(TOAST.WARNING, "No Visitor data found.");
          return;
        }

        setVisitor(formatVisitor(item));
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
  }, [visitorId]);

  return { visitor, loading };
}

export function useSubmitVisitor({
  mode = "create",
  visitorId = null,
  currentVisitorId,
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
      const byField = isCreate ? "visitorCreatedBy" : "visitorUpdatedBy";

      const submitFormData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "visitorPhoto" && value instanceof File) {
          submitFormData.append("visitorPhoto", value);
        } else if (key === "visitorDocumentPhotos" && Array.isArray(value)) {
          value.forEach((file) => {
            if (file instanceof File) {
              submitFormData.append("visitorDocumentPhotos", file);
            }
          });
        } else if (value !== null && value !== undefined) {
          submitFormData.append(key, String(value));
        }
      });

      submitFormData.append(byField, currentVisitorId);

      const url = isCreate ? API_URL : `${API_URL}/${visitorId}`;
      const method = isCreate ? "POST" : "PUT";

      try {
        const response = await fetch(url, {
          method,
          credentials: "include",
          body: submitFormData,
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok) {
          showToast(TOAST.SUCCESS, result.message || "Success");
          setTimeout(() => router.push("/security/visitor"), 1500);
        } else {
          if (result.details && typeof result.details === "object") {
            setErrors(result.details);
          } else {
            setErrors({});
          }

          showToast(TOAST.DANGER, result.error || "Failed to submit Visitor.");
        }
      } catch (err) {
        showToast(
          TOAST.DANGER,
          `Failed to submit Visitor: ${getErrorMessage(err)}`
        );
      }
    },
    [mode, visitorId, currentVisitorId, router]
  );
}

export function useCheckoutVisitor() {
  const [loading, setLoading] = useState(false);

  const checkout = useCallback(async (visitorId, updatedBy, onSuccess) => {
    if (!visitorId || !updatedBy) {
      showToast(TOAST.DANGER, "Missing required parameters");
      return false;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/${visitorId}/checkout`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updatedBy }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        showToast(TOAST.SUCCESS, result.message || "Checkout successful");
        if (onSuccess) onSuccess(result.visitor);
        return true;
      } else {
        showToast(TOAST.DANGER, result.error || "Failed to checkout visitor");
        return false;
      }
    } catch (err) {
      showToast(TOAST.DANGER, `Checkout failed: ${getErrorMessage(err)}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { checkout, loading };
}
