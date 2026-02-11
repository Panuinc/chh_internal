"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PermissionList, PermissionForm, usePermission } from "@/features/hr";
import { Loading, PermissionDenied } from "@/components";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useFormHandler, useMenu } from "@/hooks";
import { showToast } from "@/components/ui/Toast";

const API_URL = "/api/hr/permission";
const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
};

// Inner component that uses searchParams
function PermissionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = useMenu();
  const { userId: sessionUserId, userName } = useSessionUser();

  // Get mode from query params
  const mode = searchParams.get("mode") || "list"; // "list" | "create" | "edit"
  const editId = searchParams.get("id");

  // Refresh key for refetching list
  const [refreshKey, setRefreshKey] = useState(0);

  // List data
  const [permissions, setPermissions] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  // Fetch permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      setListLoading(true);
      try {
        const response = await fetch(API_URL, { credentials: "include" });
        const result = await response.json().catch(() => ({}));
        const items = result.permissions || result.data || [];
        setPermissions(items);
      } catch (err) {
        showToast(TOAST.DANGER, `Error fetching permissions: ${err.message}`);
      } finally {
        setListLoading(false);
      }
    };

    fetchPermissions();
  }, [refreshKey]);

  // Edit mode: fetch permission data
  const { permission, loading: permissionLoading } = usePermission(
    mode === "edit" && editId ? editId : null,
  );

  // Permission checks for list view
  if (mode === "list" && !hasPermission("hr.permission.view")) {
    return <PermissionDenied />;
  }

  // Permission checks for create/edit modes
  if (mode === "create" && !hasPermission("hr.permission.create")) {
    return <PermissionDenied />;
  }

  if (mode === "edit" && !hasPermission("hr.permission.edit")) {
    return <PermissionDenied />;
  }

  // Trigger refresh
  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Navigation with query params
  const navigateTo = useCallback(
    (newMode, id = null) => {
      const params = new URLSearchParams();
      if (newMode !== "list") params.set("mode", newMode);
      if (id) params.set("id", id);

      const queryString = params.toString();
      const url = queryString
        ? `/hr/permission?${queryString}`
        : "/hr/permission";

      router.push(url);
    },
    [router],
  );

  // Submit handler for create
  const handleCreateSubmit = useCallback(
    async (formRef, formData, setErrors) => {
      const payload = {
        ...formData,
        permissionCreatedBy: sessionUserId,
      };

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok) {
          showToast(
            TOAST.SUCCESS,
            result.message || "Permission created successfully",
          );
          triggerRefresh();
          navigateTo("list");
          return { success: true };
        } else {
          if (result.details && typeof result.details === "object") {
            setErrors(result.details);
          }
          showToast(
            TOAST.DANGER,
            result.error || "Failed to create permission",
          );
          return { success: false };
        }
      } catch (err) {
        showToast(TOAST.DANGER, `Failed to create permission: ${err.message}`);
        return { success: false };
      }
    },
    [sessionUserId, triggerRefresh, navigateTo],
  );

  // Submit handler for update
  const handleUpdateSubmit = useCallback(
    async (formRef, formData, setErrors) => {
      if (!editId) return { success: false };

      const payload = {
        ...formData,
        permissionUpdatedBy: sessionUserId,
      };

      try {
        const response = await fetch(`${API_URL}/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok) {
          showToast(
            TOAST.SUCCESS,
            result.message || "Permission updated successfully",
          );
          triggerRefresh();
          navigateTo("list");
          return { success: true };
        } else {
          if (result.details && typeof result.details === "object") {
            setErrors(result.details);
          }
          showToast(
            TOAST.DANGER,
            result.error || "Failed to update permission",
          );
          return { success: false };
        }
      } catch (err) {
        showToast(TOAST.DANGER, `Failed to update permission: ${err.message}`);
        return { success: false };
      }
    },
    [sessionUserId, editId, triggerRefresh, navigateTo],
  );

  // Form handlers
  const createFormHandler = useFormHandler(
    { permissionName: "" },
    handleCreateSubmit,
  );

  const updateFormHandler = useFormHandler(
    { permissionName: "", permissionStatus: "" },
    handleUpdateSubmit,
  );

  // Update form data when permission loaded (edit mode)
  useEffect(() => {
    if (mode === "edit" && permission) {
      updateFormHandler.setFormData({
        permissionName: permission.permissionName || "",
        permissionStatus: permission.permissionStatus || "",
      });
    }
  }, [mode, permission]);

  // Reset forms when leaving create/edit
  useEffect(() => {
    if (mode === "list") {
      createFormHandler.setFormData({ permissionName: "" });
      updateFormHandler.setFormData({
        permissionName: "",
        permissionStatus: "",
      });
    }
  }, [mode]);

  // Navigation handlers
  const handleAddNew = useCallback(() => {
    if (!hasPermission("hr.permission.create")) return;
    navigateTo("create");
  }, [hasPermission, navigateTo]);

  const handleEdit = useCallback(
    (item) => {
      if (!hasPermission("hr.permission.edit")) return;
      navigateTo("edit", item.permissionId);
    },
    [hasPermission, navigateTo],
  );

  const handleBackToList = useCallback(() => {
    navigateTo("list");
  }, [navigateTo]);

  // Render based on mode
  if (mode === "list") {
    return (
      <PermissionList
        Permissions={permissions}
        loading={listLoading}
        onAddNew={hasPermission("hr.permission.create") ? handleAddNew : null}
        onEdit={hasPermission("hr.permission.edit") ? handleEdit : null}
      />
    );
  }

  if (mode === "create") {
    return (
      <div className="flex flex-col w-full h-full">
        <div className="flex items-center gap-2 p-2 border-b border-default">
          <button
            onClick={handleBackToList}
            className="text-sm text-primary hover:underline"
          >
            ← Back to List
          </button>
        </div>
        <PermissionForm
          formHandler={createFormHandler}
          mode="create"
          operatedBy={userName}
        />
      </div>
    );
  }

  if (mode === "edit") {
    if (permissionLoading) {
      return (
        <div className="flex flex-col w-full h-full">
          <div className="flex items-center gap-2 p-2 border-b border-default">
            <button
              onClick={handleBackToList}
              className="text-sm text-primary hover:underline"
            >
              ← Back to List
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Loading />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col w-full h-full">
        <div className="flex items-center gap-2 p-2 border-b border-default">
          <button
            onClick={handleBackToList}
            className="text-sm text-primary hover:underline"
          >
            ← Back to List
          </button>
        </div>
        <PermissionForm
          formHandler={updateFormHandler}
          mode="update"
          operatedBy={userName}
          isUpdate
        />
      </div>
    );
  }

  return null;
}

// Main export with Suspense wrapper
export default function PermissionPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PermissionPageContent />
    </Suspense>
  );
}
