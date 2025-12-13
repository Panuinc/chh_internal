"use client";
import { useState, useEffect, useCallback } from "react";
import { addToast } from "@heroui/toast";

export function usePermission() {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setError(err.message);
      addToast({
        title: "Error",
        description: "Failed to load data",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      addToast({
        title: "Error",
        description: err.message,
        color: "danger",
      });
      return { success: false, error: err.message };
    }
  }, []);

  const createPermission = useCallback(async (permName) => {
    try {
      const res = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permName }),
      });

      const result = await res.json();

      if (result.success) {
        addToast({
          title: "Permission created successfully",
          color: "success",
        });
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Error creating permission:", err);
      addToast({
        title: "Error",
        description: err.message,
        color: "danger",
      });
      return { success: false, error: err.message };
    }
  }, []);

  const updatePermission = useCallback(async (permId, data) => {
    try {
      const res = await fetch(`/api/permissions/${permId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        addToast({
          title: "Permission updated successfully",
          color: "success",
        });
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Error updating permission:", err);
      addToast({
        title: "Error",
        description: err.message,
        color: "danger",
      });
      return { success: false, error: err.message };
    }
  }, []);

  const deletePermission = useCallback(async (permId) => {
    try {
      const res = await fetch(`/api/permissions/${permId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (result.success) {
        addToast({
          title: "Permission deleted successfully",
          color: "success",
        });
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error("Error deleting permission:", err);
      addToast({
        title: "Error",
        description: err.message,
        color: "danger",
      });
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    isLoading,
    error,

    fetchPermissions,
    fetchPermissionById,
    createPermission,
    updatePermission,
    deletePermission,

    permissionCount: permissions.length,
  };
}

export function usePermissionForm(initialData = {}) {
  const [formData, setFormData] = useState({
    permName: initialData.permName || "",
    permStatus: initialData.permStatus || "Active",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.permName.trim()) {
      newErrors.permName = "Permission name is required";
    } else if (!/^[a-zA-Z]+(\.[a-zA-Z*]+)*$/.test(formData.permName)) {
      newErrors.permName = "Invalid format (e.g. hr.view, hr.employee.create)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData({
      permName: "",
      permStatus: "Active",
    });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    setField,
    setIsSubmitting,
    validate,
    reset,
  };
}

export default usePermission;
