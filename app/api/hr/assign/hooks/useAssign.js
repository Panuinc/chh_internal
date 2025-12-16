"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import showToast from "@/components/UIToast";

const API_URL = "/api/hr/assign";

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

export function useEmployeeAssigns(employeeId) {
  const [assigns, setAssigns] = useState([]);
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
          `${API_URL}/employee/${employeeId}`,
          {},
          controller.signal
        );

        const items = result.assigns || [];
        setAssigns(items);
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

  const assignedPermissionIds = useMemo(() => {
    return assigns.map((a) => a.assignPermissionId);
  }, [assigns]);

  return { assigns, assignedPermissionIds, loading };
}

export function useSyncAssigns({ employeeId, currentUserId }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const syncPermissions = useCallback(
    async (permissionIds) => {
      if (!employeeId || !currentUserId) {
        showToast(TOAST.DANGER, "Missing required data");
        return;
      }

      setSaving(true);

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            employeeId,
            permissionIds: Array.from(permissionIds),
            assignCreatedBy: currentUserId,
          }),
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok) {
          showToast(TOAST.SUCCESS, result.message || "Permissions updated");
          setTimeout(() => router.push("/hr/assign"), 1500);
        } else {
          showToast(TOAST.DANGER, result.error || "Failed to update");
        }
      } catch (err) {
        showToast(TOAST.DANGER, `Error: ${getErrorMessage(err)}`);
      } finally {
        setSaving(false);
      }
    },
    [employeeId, currentUserId, router]
  );

  return { syncPermissions, saving };
}

export function groupPermissionsByCategory(permissions) {
  const groups = {};

  permissions.forEach((permission) => {
    const name = permission.permissionName || "";
    const dotIndex = name.indexOf(".");
    const category = dotIndex > 0 ? name.substring(0, dotIndex) : "other";

    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(permission);
  });

  const sortedCategories = Object.keys(groups).sort();

  return sortedCategories.map((category) => ({
    category,
    categoryLabel: category.charAt(0).toUpperCase() + category.slice(1),
    permissions: groups[category].sort((a, b) =>
      a.permissionName.localeCompare(b.permissionName)
    ),
  }));
}
