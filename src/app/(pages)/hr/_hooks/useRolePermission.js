"use client";

import { useState, useCallback } from "react";

/**
 * Hook for managing role permissions (RBAC)
 */
export function useRolePermission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get all permissions for a role
   */
  const getRolePermissions = useCallback(async (roleId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/hr/role/${roleId}/permission`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch role permissions");
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update permissions for a role (sync - add/remove)
   */
  const updateRolePermissions = useCallback(async (roleId, permissionIds, updatedBy) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/hr/role/${roleId}/permission`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ permissionIds, updatedBy }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update role permissions");
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getRolePermissions,
    updateRolePermissions,
  };
}

export default useRolePermission;
