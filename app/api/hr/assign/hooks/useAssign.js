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
    const parts = name.split(".");
    const category = parts[0] || "other";

    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(permission);
  });

  const sortedCategories = Object.keys(groups).sort();

  const actionPriority = {
    "*": 0,
    view: 1,
    create: 2,
    edit: 3,
    update: 4,
    delete: 5,
  };

  return sortedCategories.map((category) => {
    const categoryPermissions = groups[category];

    const subGroups = {};

    categoryPermissions.forEach((permission) => {
      const name = permission.permissionName || "";
      const parts = name.split(".");

      const subCategory = parts.length <= 2 ? "_module" : parts[1];

      if (!subGroups[subCategory]) {
        subGroups[subCategory] = [];
      }
      subGroups[subCategory].push(permission);
    });

    const sortedSubGroups = Object.keys(subGroups).sort((a, b) => {
      if (a === "_module") return -1;
      if (b === "_module") return 1;
      return a.localeCompare(b);
    });

    const subGroupsArray = sortedSubGroups.map((subKey) => ({
      subCategory: subKey,
      subCategoryLabel:
        subKey === "_module"
          ? "Module Access"
          : subKey.charAt(0).toUpperCase() + subKey.slice(1),
      permissions: subGroups[subKey].sort((a, b) => {
        const aAction = a.permissionName.split(".").pop();
        const bAction = b.permissionName.split(".").pop();

        const aPriority = actionPriority[aAction] ?? 999;
        const bPriority = actionPriority[bAction] ?? 999;

        if (aPriority !== bPriority) return aPriority - bPriority;
        return a.permissionName.localeCompare(b.permissionName);
      }),
    }));

    return {
      category,
      categoryLabel: category.charAt(0).toUpperCase() + category.slice(1),
      subGroups: subGroupsArray,
      permissions: categoryPermissions,
    };
  });
}
