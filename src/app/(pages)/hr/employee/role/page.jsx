"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEmployees, useRoles, useEmployeeRole, EmployeeRoleForm } from "@/features/hr";
import { useMenu, useSessionUser } from "@/hooks";
import { PermissionDenied } from "@/components";

export default function EmployeeRolePage() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { user } = useSessionUser();

  const { employees, loading: employeesLoading } = useEmployees();
  const { roles, loading: rolesLoading } = useRoles();
  const { loading: saving, getEmployeeRoles, updateEmployeeRoles } = useEmployeeRole();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [loadingEmployeeRoles, setLoadingEmployeeRoles] = useState(false);
  const [error, setError] = useState(null);

  const canEdit = hasPermission("hr.employee.role.edit");

  useEffect(() => {
    if (!selectedEmployeeId) {
      setEmployeeRoles([]);
      setSelectedRoles([]);
      return;
    }

    const loadEmployeeRoles = async () => {
      setLoadingEmployeeRoles(true);
      setError(null);
      try {
        const data = await getEmployeeRoles(selectedEmployeeId);
        setEmployeeRoles(data.roles || []);
        setSelectedRoles((data.roles || []).map((r) => r.employeeRoleRoleId));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingEmployeeRoles(false);
      }
    };

    loadEmployeeRoles();
  }, [selectedEmployeeId, getEmployeeRoles]);

  const handleRoleToggle = (roleId) => {
    if (!canEdit) return;

    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    if (!canEdit || !selectedEmployeeId || !user?.id) return;

    setError(null);

    try {
      await updateEmployeeRoles(selectedEmployeeId, selectedRoles, user.id);
      const data = await getEmployeeRoles(selectedEmployeeId);
      setEmployeeRoles(data.roles || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setSelectedEmployeeId("");
    setError(null);
  };

  if (!hasPermission("hr.employee.role.view")) {
    return <PermissionDenied />;
  }

  return (
    <EmployeeRoleForm
      employees={employees}
      roles={roles}
      employeeRoles={employeeRoles}
      selectedEmployeeId={selectedEmployeeId}
      selectedRoles={selectedRoles}
      onEmployeeChange={setSelectedEmployeeId}
      onRoleToggle={handleRoleToggle}
      onSubmit={handleSave}
      onCancel={handleCancel}
      loading={employeesLoading || rolesLoading || loadingEmployeeRoles}
      saving={saving}
      canEdit={canEdit}
      error={error}
      user={user}
    />
  );
}
