"use client";

import { useState, useCallback } from "react";

/**
 * Hook for managing employee roles (RBAC)
 */
export function useEmployeeRole() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Get all roles for an employee
   */
  const getEmployeeRoles = useCallback(async (employeeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/hr/employee/${employeeId}/role`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch employee roles");
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
   * Get all permissions for an employee (aggregated from all roles)
   */
  const getEmployeePermissions = useCallback(async (employeeId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/hr/employee/${employeeId}/permission`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch employee permissions");
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
   * Update roles for an employee (sync - add/remove)
   */
  const updateEmployeeRoles = useCallback(async (employeeId, roleIds, updatedBy) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/hr/employee/${employeeId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roleIds, updatedBy }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update employee roles");
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
    getEmployeeRoles,
    getEmployeePermissions,
    updateEmployeeRoles,
  };
}

export default useEmployeeRole;
