"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmployeeList, EmployeeForm, useEmployee, useDepartments, useRoles } from "@/features/hr";
import { Loading } from "@/components";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useFormHandler, useMenu } from "@/hooks";
import { showToast } from "@/components/ui/Toast";

const API_URL = "/api/hr/employee";
const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
};

function EmployeePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = useMenu();
  const { userId: sessionUserId, userName } = useSessionUser();

  const mode = searchParams.get("mode") || "list";
  const editId = searchParams.get("id");

  const [refreshKey, setRefreshKey] = useState(0);

  const [employees, setEmployees] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      setListLoading(true);
      try {
        const response = await fetch(`${API_URL}?limit=9999`, { credentials: "include" });
        const result = await response.json().catch(() => ({}));
        const items = result.employees || result.data || [];
        setEmployees(items);
      } catch (err) {
        showToast(TOAST.DANGER, `Error fetching employees: ${err.message}`);
      } finally {
        setListLoading(false);
      }
    };

    fetchEmployees();
  }, [refreshKey]);

  const { departments } = useDepartments(undefined, true);
  const { roles } = useRoles(undefined, true);

  const { employee, loading: employeeLoading } = useEmployee(
    mode === "edit" && editId ? editId : null,
  );

  if (mode === "list" && !hasPermission("hr.employee.view")) {
    return <PermissionDenied />;
  }

  if (mode === "create" && !hasPermission("hr.employee.create")) {
    return <PermissionDenied />;
  }

  if (mode === "edit" && !hasPermission("hr.employee.edit")) {
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
        ? `/hr/employee?${queryString}`
        : "/hr/employee";

      router.push(url);
    },
    [router],
  );

  const handleCreateSubmit = useCallback(
    async (formRef, formData, setErrors) => {
      const payload = {
        employeeFirstName: formData.employeeFirstName,
        employeeLastName: formData.employeeLastName,
        employeeEmail: formData.employeeEmail,
        employeeDepartmentId: formData.employeeDepartmentId || null,
        employeeRoleId: formData.employeeRoleId || null,
        employeeCreatedBy: sessionUserId,
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
            result.message || "Employee created successfully",
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
            result.error || "Failed to create employee",
          );
          return { success: false };
        }
      } catch (err) {
        showToast(TOAST.DANGER, `Failed to create employee: ${err.message}`);
        return { success: false };
      }
    },
    [sessionUserId, triggerRefresh, navigateTo],
  );

  const handleUpdateSubmit = useCallback(
    async (formRef, formData, setErrors) => {
      if (!editId) return { success: false };

      const payload = {
        employeeFirstName: formData.employeeFirstName,
        employeeLastName: formData.employeeLastName,
        employeeEmail: formData.employeeEmail,
        employeeStatus: formData.employeeStatus,
        employeeDepartmentId: formData.employeeDepartmentId || null,
        employeeRoleId: formData.employeeRoleId || null,
        employeeUpdatedBy: sessionUserId,
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
            result.message || "Employee updated successfully",
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
            result.error || "Failed to update employee",
          );
          return { success: false };
        }
      } catch (err) {
        showToast(TOAST.DANGER, `Failed to update employee: ${err.message}`);
        return { success: false };
      }
    },
    [sessionUserId, editId, triggerRefresh, navigateTo],
  );

  const createFormHandler = useFormHandler(
    {
      employeeFirstName: "",
      employeeLastName: "",
      employeeEmail: "",
      employeeDepartmentId: "",
      employeeRoleId: "",
    },
    handleCreateSubmit,
  );

  const updateFormHandler = useFormHandler(
    {
      employeeFirstName: "",
      employeeLastName: "",
      employeeEmail: "",
      employeeStatus: "",
      employeeDepartmentId: "",
      employeeRoleId: "",
    },
    handleUpdateSubmit,
  );

  useEffect(() => {
    if (mode === "edit" && employee) {
      updateFormHandler.setFormData({
        employeeFirstName: employee.employeeFirstName || "",
        employeeLastName: employee.employeeLastName || "",
        employeeEmail: employee.employeeEmail || "",
        employeeStatus: employee.employeeStatus || "",
        employeeDepartmentId: employee.employeeDepartmentId || "",
        employeeRoleId: employee.employeeRoleId || "",
      });
    }
  }, [mode, employee]);

  useEffect(() => {
    if (mode === "list") {
      createFormHandler.setFormData({
        employeeFirstName: "",
        employeeLastName: "",
        employeeEmail: "",
        employeeDepartmentId: "",
        employeeRoleId: "",
      });
      updateFormHandler.setFormData({
        employeeFirstName: "",
        employeeLastName: "",
        employeeEmail: "",
        employeeStatus: "",
        employeeDepartmentId: "",
        employeeRoleId: "",
      });
    }
  }, [mode]);

  const handleAddNew = useCallback(() => {
    if (!hasPermission("hr.employee.create")) return;
    navigateTo("create");
  }, [hasPermission, navigateTo]);

  const handleEdit = useCallback(
    (item) => {
      if (!hasPermission("hr.employee.edit")) return;
      navigateTo("edit", item.employeeId);
    },
    [hasPermission, navigateTo],
  );

  const handleBackToList = useCallback(() => {
    navigateTo("list");
  }, [navigateTo]);

  if (mode === "list") {
    return (
      <EmployeeList
        Employees={employees}
        loading={listLoading}
        onAddNew={hasPermission("hr.employee.create") ? handleAddNew : null}
        onEdit={hasPermission("hr.employee.edit") ? handleEdit : null}
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
        <EmployeeForm
          formHandler={createFormHandler}
          mode="create"
          operatedBy={userName}
          departments={departments}
          roles={roles}
        />
      </div>
    );
  }

  if (mode === "edit") {
    if (employeeLoading) {
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
        <EmployeeForm
          formHandler={updateFormHandler}
          mode="update"
          operatedBy={userName}
          isUpdate
          departments={departments}
          roles={roles}
        />
      </div>
    );
  }

  return null;
}

export default function EmployeePage() {
  return (
    <Suspense fallback={<Loading />}>
      <EmployeePageContent />
    </Suspense>
  );
}
