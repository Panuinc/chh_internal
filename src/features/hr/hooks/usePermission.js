"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/Toast";

const API_URL = "/api/hr/permission";

const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
  WARNING: "warning",
};

function formatPermission(permission, index = null) {
  if (!permission) return null;

  const getFullName = (employee) =>
    employee
      ? `${employee.employeeFirstName} ${employee.employeeLastName}`
      : "-";

  return {
    ...permission,
    ...(index !== null && { permissionIndex: index + 1 }),
    permissionCreatedBy: getFullName(permission.createdByEmployee),
    permissionUpdatedBy: getFullName(permission.updatedByEmployee),
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

export function usePermissions(apiUrl = API_URL, fetchAll = true) {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        // Fetch all permissions by adding a large limit
        const url = fetchAll ? `${apiUrl}?limit=9999` : apiUrl;
        const result = await fetchWithAbort(url, {}, controller.signal);

        const items = result.permissions || result.data || [];

        const formatted = Array.isArray(items)
          ? items.map((p, i) => formatPermission(p, i)).filter(Boolean)
          : [];

        setPermissions(formatted);
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
  }, [apiUrl, fetchAll]);

  return { permissions, loading };
}

export function usePermission(permissionId) {
  const [permission, setPermission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!permissionId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const result = await fetchWithAbort(
          `${API_URL}/${permissionId}`,
          {},
          controller.signal
        );

        const item = result.permission || result.data;

        if (!item) {
          showToast(TOAST.WARNING, "No Permission data found.");
          return;
        }

        setPermission(formatPermission(item));
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
  }, [permissionId]);

  return { permission, loading };
}

export function useSubmitPermission({
  mode = "create",
  permissionId = null,
  currentPermissionId,
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
      const byField = isCreate ? "permissionCreatedBy" : "permissionUpdatedBy";

      const payload = {
        ...formData,
        [byField]: currentPermissionId,
      };

      const url = isCreate ? API_URL : `${API_URL}/${permissionId}`;
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
          setTimeout(() => router.push("/hr/permission"), 1500);
        } else {
          if (result.details && typeof result.details === "object") {
            setErrors(result.details);
          } else {
            setErrors({});
          }

          showToast(
            TOAST.DANGER,
            result.error || "Failed to submit Permission."
          );
        }
      } catch (err) {
        showToast(
          TOAST.DANGER,
          `Failed to submit Permission: ${getErrorMessage(err)}`
        );
      }
    },
    [mode, permissionId, currentPermissionId, router]
  );
}
