"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DepartmentList, DepartmentForm, useDepartment } from "@/features/hr";
import { Loading, PermissionDenied } from "@/components";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useFormHandler, useMenu } from "@/hooks";
import { showToast } from "@/components/ui/Toast";

const API_URL = "/api/hr/department";
const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
};

function DepartmentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = useMenu();
  const { userId: sessionUserId, userName } = useSessionUser();

  const mode = searchParams.get("mode") || "list";
  const editId = searchParams.get("id");

  const [refreshKey, setRefreshKey] = useState(0);

  const [departments, setDepartments] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      setListLoading(true);
      try {
        const response = await fetch(API_URL, { credentials: "include" });
        const result = await response.json().catch(() => ({}));
        const items = result.departments || result.data || [];
        setDepartments(items);
      } catch (err) {
        showToast(TOAST.DANGER, `Error fetching departments: ${err.message}`);
      } finally {
        setListLoading(false);
      }
    };

    fetchDepartments();
  }, [refreshKey]);

  const { department, loading: departmentLoading } = useDepartment(
    mode === "edit" && editId ? editId : null,
  );

  if (mode === "list" && !hasPermission("hr.department.view")) {
    return <PermissionDenied />;
  }

  if (mode === "create" && !hasPermission("hr.department.create")) {
    return <PermissionDenied />;
  }

  if (mode === "edit" && !hasPermission("hr.department.edit")) {
    return <PermissionDenied />;
  }

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
        ? `/hr/department?${queryString}`
        : "/hr/department";

      router.push(url);
    },
    [router],
  );

  const handleCreateSubmit = useCallback(
    async (formRef, formData, setErrors) => {
      const payload = {
        ...formData,
        departmentCreatedBy: sessionUserId,
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
            result.message || "Department created successfully",
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
            result.error || "Failed to create department",
          );
          return { success: false };
        }
      } catch (err) {
        showToast(TOAST.DANGER, `Failed to create department: ${err.message}`);
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
        departmentUpdatedBy: sessionUserId,
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
            result.message || "Department updated successfully",
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
            result.error || "Failed to update department",
          );
          return { success: false };
        }
      } catch (err) {
        showToast(TOAST.DANGER, `Failed to update department: ${err.message}`);
        return { success: false };
      }
    },
    [sessionUserId, editId, triggerRefresh, navigateTo],
  );

  const createFormHandler = useFormHandler(
    { departmentName: "" },
    handleCreateSubmit,
  );

  const updateFormHandler = useFormHandler(
    { departmentName: "", departmentStatus: "" },
    handleUpdateSubmit,
  );

  useEffect(() => {
    if (mode === "edit" && department) {
      updateFormHandler.setFormData({
        departmentName: department.departmentName || "",
        departmentStatus: department.departmentStatus || "",
      });
    }
  }, [mode, department]);

  useEffect(() => {
    if (mode === "list") {
      createFormHandler.setFormData({ departmentName: "" });
      updateFormHandler.setFormData({
        departmentName: "",
        departmentStatus: "",
      });
    }
  }, [mode]);

  const handleAddNew = useCallback(() => {
    if (!hasPermission("hr.department.create")) return;
    navigateTo("create");
  }, [hasPermission, navigateTo]);

  const handleEdit = useCallback(
    (item) => {
      if (!hasPermission("hr.department.edit")) return;
      navigateTo("edit", item.departmentId);
    },
    [hasPermission, navigateTo],
  );

  const handleBackToList = useCallback(() => {
    navigateTo("list");
  }, [navigateTo]);

  if (mode === "list") {
    return (
      <DepartmentList
        Departments={departments}
        loading={listLoading}
        onAddNew={hasPermission("hr.department.create") ? handleAddNew : null}
        onEdit={hasPermission("hr.department.edit") ? handleEdit : null}
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
        <DepartmentForm
          formHandler={createFormHandler}
          mode="create"
          operatedBy={userName}
        />
      </div>
    );
  }

  if (mode === "edit") {
    if (departmentLoading) {
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
        <DepartmentForm
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

export default function DepartmentPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DepartmentPageContent />
    </Suspense>
  );
}
