"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import showToast from "@/components/UIToast";

const API_URL = "/api/hr/role";

const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
  WARNING: "warning",
};

function formatRole(role, index = null) {
  if (!role) return null;

  const getFullName = (employee) =>
    employee
      ? `${employee.employeeFirstName} ${employee.employeeLastName}`
      : "-";

  return {
    ...role,
    ...(index !== null && { roleIndex: index + 1 }),
    roleCreatedBy: getFullName(role.createdByEmployee),
    roleUpdatedBy: getFullName(role.updatedByEmployee),
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

export function useRoles(apiUrl = API_URL, fetchAll = false) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        // Fetch all by adding a large limit
        const url = fetchAll ? `${apiUrl}?limit=9999` : apiUrl;
        const result = await fetchWithAbort(url, {}, controller.signal);

        const items = result.roles || result.data || [];

        const formatted = Array.isArray(items)
          ? items.map((p, i) => formatRole(p, i)).filter(Boolean)
          : [];

        setRoles(formatted);
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

  return { roles, loading };
}

export function useRole(roleId) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const result = await fetchWithAbort(
          `${API_URL}/${roleId}`,
          {},
          controller.signal
        );

        const item = result.role || result.data;

        if (!item) {
          showToast(TOAST.WARNING, "No Role data found.");
          return;
        }

        setRole(formatRole(item));
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
  }, [roleId]);

  return { role, loading };
}

export function useSubmitRole({
  mode = "create",
  roleId = null,
  currentRoleId,
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
      const byField = isCreate ? "roleCreatedBy" : "roleUpdatedBy";

      const payload = {
        ...formData,
        [byField]: currentRoleId,
      };

      const url = isCreate ? API_URL : `${API_URL}/${roleId}`;
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
          setTimeout(() => router.push("/hr/role"), 1500);
        } else {
          if (result.details && typeof result.details === "object") {
            setErrors(result.details);
          } else {
            setErrors({});
          }

          showToast(
            TOAST.DANGER,
            result.error || "Failed to submit Role."
          );
        }
      } catch (err) {
        showToast(
          TOAST.DANGER,
          `Failed to submit Role: ${getErrorMessage(err)}`
        );
      }
    },
    [mode, roleId, currentRoleId, router]
  );
}
