"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RoleList, RoleForm, useRole } from "@/features/hr";
import { Loading, PermissionDenied } from "@/components";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useFormHandler, useMenu } from "@/hooks";
import { showToast } from "@/components/ui/Toast";

const API_URL = "/api/hr/role";
const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
};

function RolePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = useMenu();
  const { userId: sessionUserId, userName } = useSessionUser();

  const mode = searchParams.get("mode") || "list";
  const editId = searchParams.get("id");

  const [refreshKey, setRefreshKey] = useState(0);

  const [roles, setRoles] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      setListLoading(true);
      try {
        const response = await fetch(API_URL, { credentials: "include" });
        const result = await response.json().catch(() => ({}));
        const items = result.roles || result.data || [];
        setRoles(items);
      } catch (err) {
        showToast(TOAST.DANGER, `Error fetching roles: ${err.message}`);
      } finally {
        setListLoading(false);
      }
    };

    fetchRoles();
  }, [refreshKey]);

  const { role, loading: roleLoading } = useRole(
    mode === "edit" && editId ? editId : null,
  );

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const navigateTo = useCallback(
    (newMode, id = null) => {
      const params = new URLSearchParams();
      if (newMode !== "list") params.set("mode", newMode);
      if (id) params.set("id", id);

      const queryString = params.toString();
      const url = queryString
        ? `/hr/role?${queryString}`
        : "/hr/role";

      router.push(url);
    },
    [router],
  );

  const handleCreateSubmit = useCallback(
    async (formRef, formData, setErrors) => {
      const payload = {
        ...formData,
        roleCreatedBy: sessionUserId,
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
            result.message || "Role created successfully",
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
            result.error || "Failed to create role",
          );
          return { success: false };
        }
      } catch (err) {
        showToast(TOAST.DANGER, `Failed to create role: ${err.message}`);
        return { success: false };
      }
    },
    [sessionUserId, triggerRefresh, navigateTo],
  );

  const handleUpdateSubmit = useCallback(
    async (formRef, formData, setErrors) => {
      if (!editId) return { success: false };

      const payload = {
        ...formData,
        roleUpdatedBy: sessionUserId,
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
            result.message || "Role updated successfully",
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
            result.error || "Failed to update role",
          );
          return { success: false };
        }
      } catch (err) {
        showToast(TOAST.DANGER, `Failed to update role: ${err.message}`);
        return { success: false };
      }
    },
    [sessionUserId, editId, triggerRefresh, navigateTo],
  );

  const createFormHandler = useFormHandler(
    { roleName: "" },
    handleCreateSubmit,
  );

  const updateFormHandler = useFormHandler(
    { roleName: "", roleStatus: "" },
    handleUpdateSubmit,
  );

  useEffect(() => {
    if (mode === "edit" && role) {
      updateFormHandler.setFormData({
        roleName: role.roleName || "",
        roleStatus: role.roleStatus || "",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, role]);

  useEffect(() => {
    if (mode === "list") {
      createFormHandler.setFormData({ roleName: "" });
      updateFormHandler.setFormData({
        roleName: "",
        roleStatus: "",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleAddNew = useCallback(() => {
    if (!hasPermission("hr.role.create")) return;
    navigateTo("create");
  }, [hasPermission, navigateTo]);

  const handleEdit = useCallback(
    (item) => {
      if (!hasPermission("hr.role.edit")) return;
      navigateTo("edit", item.roleId);
    },
    [hasPermission, navigateTo],
  );

  const handleBackToList = useCallback(() => {
    navigateTo("list");
  }, [navigateTo]);

  if (mode === "list" && !hasPermission("hr.role.view")) {
    return <PermissionDenied />;
  }

  if (mode === "create" && !hasPermission("hr.role.create")) {
    return <PermissionDenied />;
  }

  if (mode === "edit" && !hasPermission("hr.role.edit")) {
    return <PermissionDenied />;
  }

  if (mode === "list") {
    return (
      <RoleList
        Roles={roles}
        loading={listLoading}
        onAddNew={hasPermission("hr.role.create") ? handleAddNew : null}
        onEdit={hasPermission("hr.role.edit") ? handleEdit : null}
      />
    );
  }

  if (mode === "create") {
    return (
      <div className="flex flex-col w-full h-full">
        <div className="flex items-center gap-2 p-2 border-b-1 border-default">
          <button
            onClick={handleBackToList}
            className="text-sm text-primary hover:underline"
          >
            ← Back to List
          </button>
        </div>
        <RoleForm
          formHandler={createFormHandler}
          mode="create"
          operatedBy={userName}
        />
      </div>
    );
  }

  if (mode === "edit") {
    if (roleLoading) {
      return (
        <div className="flex flex-col w-full h-full">
          <div className="flex items-center gap-2 p-2 border-b-1 border-default">
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
        <div className="flex items-center gap-2 p-2 border-b-1 border-default">
          <button
            onClick={handleBackToList}
            className="text-sm text-primary hover:underline"
          >
            ← Back to List
          </button>
        </div>
        <RoleForm
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

export default function RolePage() {
  return (
    <Suspense fallback={<Loading />}>
      <RolePageContent />
    </Suspense>
  );
}
