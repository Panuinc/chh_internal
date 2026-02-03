"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import showToast from "@/components/UIToast";

const API_URL = "/api/hr/employee";

const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
  WARNING: "warning",
};

function formatEmployee(employee, index = null) {
  if (!employee) return null;

  const getFullName = (employee) =>
    employee
      ? `${employee.employeeFirstName} ${employee.employeeLastName}`
      : "-";

  return {
    ...employee,
    ...(index !== null && { employeeIndex: index + 1 }),
    employeeFullName: `${employee.employeeFirstName} ${employee.employeeLastName}`,
    employeeCreatedByName: getFullName(employee.createdByEmployee),
    employeeUpdatedByName: getFullName(employee.updatedByEmployee),
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

export function useEmployees(apiUrl = API_URL) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const result = await fetchWithAbort(apiUrl, {}, controller.signal);

        const items = result.employees || result.data || [];

        const formatted = Array.isArray(items)
          ? items.map((p, i) => formatEmployee(p, i)).filter(Boolean)
          : [];

        setEmployees(formatted);
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

  return { employees, loading };
}

export function useEmployee(employeeId) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const result = await fetchWithAbort(
          `${API_URL}/${employeeId}`,
          {},
          controller.signal
        );

        const item = result.employee || result.data;

        if (!item) {
          showToast(TOAST.WARNING, "No Employee data found.");
          return;
        }

        setEmployee(formatEmployee(item));
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
  }, [employeeId]);

  return { employee, loading };
}

export function useSubmitEmployee({
  mode = "create",
  employeeId = null,
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
      const byField = isCreate ? "employeeCreatedBy" : "employeeUpdatedBy";

      const payload = {
        employeeFirstName: formData.employeeFirstName,
        employeeLastName: formData.employeeLastName,
        employeeEmail: formData.employeeEmail,
        ...(isCreate ? {} : { employeeStatus: formData.employeeStatus }),
        [byField]: currentEmployeeId,
      };

      const url = isCreate ? API_URL : `${API_URL}/${employeeId}`;
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
          setTimeout(() => router.push("/hr/employee"), 1500);
        } else {
          if (result.details && typeof result.details === "object") {
            setErrors(result.details);
          } else {
            setErrors({});
          }

          showToast(TOAST.DANGER, result.error || "Failed to submit Employee.");
        }
      } catch (err) {
        showToast(
          TOAST.DANGER,
          `Failed to submit Employee: ${getErrorMessage(err)}`
        );
      }
    },
    [mode, employeeId, currentEmployeeId, router]
  );
}
