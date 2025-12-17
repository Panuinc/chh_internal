"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import showToast from "@/components/UIToast";

const API_URL = "/api/security/patrol";

const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
  WARNING: "warning",
};

function formatPatrol(patrol, index = null) {
  if (!patrol) return null;

  const getFullName = (employee) =>
    employee
      ? `${employee.employeeFirstName} ${employee.employeeLastName}`
      : "-";

  return {
    ...patrol,
    ...(index !== null && { patrolIndex: index + 1 }),
    patrolCreatedByName: getFullName(patrol.createdByEmployee),
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

export function usePatrols(apiUrl = API_URL) {
  const [patrols, setPatrols] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatrols = useCallback(
    async (signal) => {
      try {
        const result = await fetchWithAbort(apiUrl, {}, signal);

        const items = result.patrols || result.data || [];

        const formatted = Array.isArray(items)
          ? items.map((p, i) => formatPatrol(p, i)).filter(Boolean)
          : [];

        setPatrols(formatted);
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
    fetchPatrols(controller.signal);
    return () => controller.abort();
  }, [fetchPatrols]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPatrols(controller.signal);
    return () => controller.abort();
  }, [fetchPatrols]);

  return { patrols, loading, refetch, setPatrols };
}

export function useSubmitPatrol({ currentPatrolId }) {
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

      const submitFormData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "patrolPicture" && value instanceof File) {
          submitFormData.append("patrolPicture", value);
        } else if (value !== null && value !== undefined) {
          submitFormData.append(key, String(value));
        }
      });

      submitFormData.append("patrolCreatedBy", currentPatrolId);

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          credentials: "include",
          body: submitFormData,
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok) {
          showToast(TOAST.SUCCESS, result.message || "Success");
          setTimeout(() => router.push("/security/patrol"), 1500);
        } else {
          if (result.details && typeof result.details === "object") {
            setErrors(result.details);
          } else {
            setErrors({});
          }

          showToast(TOAST.DANGER, result.error || "Failed to submit Patrol.");
        }
      } catch (err) {
        showToast(
          TOAST.DANGER,
          `Failed to submit Patrol: ${getErrorMessage(err)}`
        );
      }
    },
    [currentPatrolId, router]
  );
}
