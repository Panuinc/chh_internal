"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoles, usePermissions, useRolePermission, RolePermissionForm } from "@/features/hr";
import { useMenu, useSessionUser } from "@/hooks";
import { PermissionDenied } from "@/components";

export default function RolePermissionPage() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { user } = useSessionUser();

  const { roles, loading: rolesLoading } = useRoles();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const { loading: saving, getRolePermissions, updateRolePermissions } = useRolePermission();

  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loadingRolePerms, setLoadingRolePerms] = useState(false);
  const [error, setError] = useState(null);

  const canEdit = hasPermission("hr.role.permission.edit");

  useEffect(() => {
    if (!selectedRoleId) {
      setRolePermissions([]);
      setSelectedPermissions([]);
      return;
    }

    const loadRolePermissions = async () => {
      setLoadingRolePerms(true);
      setError(null);
      try {
        const data = await getRolePermissions(selectedRoleId);
        setRolePermissions(data.permissions || []);
        setSelectedPermissions((data.permissions || []).map((p) => p.rolePermissionPermissionId));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingRolePerms(false);
      }
    };

    loadRolePermissions();
  }, [selectedRoleId, getRolePermissions]);

  const handlePermissionToggle = (permissionId) => {
    if (!canEdit) return;

    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    if (!canEdit || !selectedRoleId || !user?.id) return;

    setError(null);

    try {
      await updateRolePermissions(selectedRoleId, selectedPermissions, user.id);
      const data = await getRolePermissions(selectedRoleId);
      setRolePermissions(data.permissions || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setSelectedRoleId("");
    setError(null);
  };

  if (!hasPermission("hr.role.permission.view")) {
    return <PermissionDenied />;
  }

  return (
    <RolePermissionForm
      roles={roles}
      permissions={permissions}
      rolePermissions={rolePermissions}
      selectedRoleId={selectedRoleId}
      selectedPermissions={selectedPermissions}
      onRoleChange={setSelectedRoleId}
      onPermissionToggle={handlePermissionToggle}
      onSubmit={handleSave}
      onCancel={handleCancel}
      loading={rolesLoading || permissionsLoading || loadingRolePerms}
      saving={saving}
      canEdit={canEdit}
      error={error}
      user={user}
    />
  );
}
