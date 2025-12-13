"use client";
import { useState, useEffect, useCallback } from "react";
import { addToast } from "@heroui/toast";

/**
 * Custom Error Messages (Thai)
 */
const ERROR_MESSAGES = {
  "Permission not found": "ไม่พบสิทธิ์ที่ต้องการ",
  "Permission already exists": "ชื่อสิทธิ์นี้มีอยู่แล้ว",
  "Permission name already exists": "ชื่อสิทธิ์นี้มีอยู่แล้ว",
  "Permission name is required": "กรุณาระบุชื่อสิทธิ์",
  "Cannot delete superAdmin permission": "ไม่สามารถลบสิทธิ์ superAdmin ได้",
  "Invalid permission name format": "รูปแบบชื่อสิทธิ์ไม่ถูกต้อง",
  Unauthorized: "กรุณาเข้าสู่ระบบ",
  Forbidden: "คุณไม่มีสิทธิ์ดำเนินการนี้",
};

/**
 * Translate error message to Thai
 */
function translateError(error) {
  return ERROR_MESSAGES[error] || error || "เกิดข้อผิดพลาด";
}

/**
 * Hook: usePermission
 * จัดการ state และ API calls สำหรับ Permissions
 */
export function usePermission() {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch all permissions
   */
  const fetchPermissions = useCallback(async (options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.status) params.append("status", options.status);
      if (options.orderBy) params.append("orderBy", options.orderBy);
      if (options.order) params.append("order", options.order);

      const url = `/api/permissions${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      const result = await res.json();

      if (result.success) {
        setPermissions(result.data);
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
      const errorMessage = translateError(err.message);
      setError(errorMessage);
      addToast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        color: "danger",
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch permission by ID
   */
  const fetchPermissionById = useCallback(async (permId) => {
    try {
      const res = await fetch(`/api/permissions/${permId}`);
      const result = await res.json();

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Error fetching permission:", err);
      const errorMessage = translateError(err.message);
      addToast({
        title: "เกิดข้อผิดพลาด",
        description: errorMessage,
        color: "danger",
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Create new permission
   */
  const createPermission = useCallback(
    async (permName) => {
      try {
        const res = await fetch("/api/permissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permName }),
        });

        const result = await res.json();

        if (result.success) {
          addToast({
            title: "สร้างสิทธิ์สำเร็จ",
            color: "success",
          });
          // Refresh list
          await fetchPermissions();
          return { success: true, data: result.data };
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        console.error("Error creating permission:", err);
        const errorMessage = translateError(err.message);
        addToast({
          title: "เกิดข้อผิดพลาด",
          description: errorMessage,
          color: "danger",
        });
        return { success: false, error: errorMessage };
      }
    },
    [fetchPermissions]
  );

  /**
   * Update permission
   */
  const updatePermission = useCallback(
    async (permId, data) => {
      try {
        const res = await fetch(`/api/permissions/${permId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (result.success) {
          addToast({
            title: "แก้ไขสิทธิ์สำเร็จ",
            color: "success",
          });
          // Refresh list
          await fetchPermissions();
          return { success: true, data: result.data };
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        console.error("Error updating permission:", err);
        const errorMessage = translateError(err.message);
        addToast({
          title: "เกิดข้อผิดพลาด",
          description: errorMessage,
          color: "danger",
        });
        return { success: false, error: errorMessage };
      }
    },
    [fetchPermissions]
  );

  /**
   * Delete permission
   */
  const deletePermission = useCallback(
    async (permId) => {
      try {
        const res = await fetch(`/api/permissions/${permId}`, {
          method: "DELETE",
        });

        const result = await res.json();

        if (result.success) {
          addToast({
            title: "ลบสิทธิ์สำเร็จ",
            color: "success",
          });
          // Refresh list
          await fetchPermissions();
          return { success: true };
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        console.error("Error deleting permission:", err);
        const errorMessage = translateError(err.message);
        addToast({
          title: "เกิดข้อผิดพลาด",
          description: errorMessage,
          color: "danger",
        });
        return { success: false, error: errorMessage };
      }
    },
    [fetchPermissions]
  );

  // Initial fetch
  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    // State
    permissions,
    isLoading,
    error,
    permissionCount: permissions.length,

    // Actions
    fetchPermissions,
    fetchPermissionById,
    createPermission,
    updatePermission,
    deletePermission,

    // Computed
    activePermissions: permissions.filter((p) => p.permStatus === "Active"),
    inactivePermissions: permissions.filter((p) => p.permStatus === "Inactive"),
  };
}

/**
 * Hook: usePermissionForm
 * จัดการ form state สำหรับ Permission
 */
export function usePermissionForm(initialData = {}) {
  const [formData, setFormData] = useState({
    permName: initialData.permName || "",
    permStatus: initialData.permStatus || "Active",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  /**
   * Set field value
   */
  const setField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
    setIsDirty(true);
  }, []);

  /**
   * Validate form
   */
  const validate = useCallback(() => {
    const newErrors = {};

    // Validate permName
    if (!formData.permName.trim()) {
      newErrors.permName = "กรุณาระบุชื่อสิทธิ์";
    } else if (!/^[a-zA-Z]+(\.[a-zA-Z*]+)*$/.test(formData.permName)) {
      newErrors.permName =
        "รูปแบบไม่ถูกต้อง (เช่น hr.view, hr.employee.create)";
    } else if (formData.permName.length > 100) {
      newErrors.permName = "ชื่อสิทธิ์ต้องไม่เกิน 100 ตัวอักษร";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  /**
   * Reset form
   */
  const reset = useCallback(
    (data = {}) => {
      setFormData({
        permName: data.permName || initialData.permName || "",
        permStatus: data.permStatus || initialData.permStatus || "Active",
      });
      setErrors({});
      setIsDirty(false);
    },
    [initialData]
  );

  /**
   * Set server error
   */
  const setServerError = useCallback((field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  return {
    // State
    formData,
    errors,
    isSubmitting,
    isDirty,

    // Actions
    setField,
    setIsSubmitting,
    validate,
    reset,
    setServerError,

    // Computed
    isValid: Object.keys(errors).length === 0,
    canSubmit: isDirty && !isSubmitting,
  };
}

export default usePermission;