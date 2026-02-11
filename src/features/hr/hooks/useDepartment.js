"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/Toast";

const API_URL = "/api/hr/department";

const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
  WARNING: "warning",
};

function formatDepartment(department, index = null) {
  if (!department) return null;

  const getFullName = (employee) =>
    employee
      ? `${employee.employeeFirstName} ${employee.employeeLastName}`
      : "-";

  return {
    ...department,
    ...(index !== null && { departmentIndex: index + 1 }),
    departmentCreatedBy: getFullName(department.createdByEmployee),
    departmentUpdatedBy: getFullName(department.updatedByEmployee),
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
      data.error || `Request failed with status ${response.status}`,
    );
  }

  return data;
}

export function useDepartments(apiUrl = API_URL, fetchAll = false) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const url = fetchAll ? `${apiUrl}?limit=9999` : apiUrl;
        const result = await fetchWithAbort(url, {}, controller.signal);

        const items = result.departments || result.data || [];

        const formatted = Array.isArray(items)
          ? items.map((p, i) => formatDepartment(p, i)).filter(Boolean)
          : [];

        setDepartments(formatted);
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

  return { departments, loading };
}

export function useDepartment(departmentId) {
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!departmentId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const result = await fetchWithAbort(
          `${API_URL}/${departmentId}`,
          {},
          controller.signal,
        );

        const item = result.department || result.data;

        if (!item) {
          showToast(TOAST.WARNING, "No Department data found.");
          return;
        }

        setDepartment(formatDepartment(item));
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
  }, [departmentId]);

  return { department, loading };
}

export function useSubmitDepartment({
  mode = "create",
  departmentId = null,
  currentDepartmentId,
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
      const byField = isCreate ? "departmentCreatedBy" : "departmentUpdatedBy";

      const payload = {
        ...formData,
        [byField]: currentDepartmentId,
      };

      const url = isCreate ? API_URL : `${API_URL}/${departmentId}`;
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
          setTimeout(() => router.push("/hr/department"), 1500);
        } else {
          if (result.details && typeof result.details === "object") {
            setErrors(result.details);
          } else {
            setErrors({});
          }

          showToast(
            TOAST.DANGER,
            result.error || "Failed to submit Department.",
          );
        }
      } catch (err) {
        showToast(
          TOAST.DANGER,
          `Failed to submit Department: ${getErrorMessage(err)}`,
        );
      }
    },
    [mode, departmentId, currentDepartmentId, router],
  );
}
