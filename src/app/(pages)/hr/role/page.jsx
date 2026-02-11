"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { RoleList, useRoles } from "@/features/hr";
import { useMenu } from "@/hooks";

export default function RolePage() {
  const router = useRouter();
  const { roles, loading } = useRoles();
  const { hasPermission } = useMenu();

  const handleAddNew = () => {
    if (!hasPermission("hr.role.create")) return;
    router.push("/hr/role/create");
  };

  const handleEdit = (item) => {
    if (!hasPermission("hr.role.edit")) return;
    router.push(`/hr/role/${item.roleId}`);
  };

  return <RoleList Roles={roles} loading={loading} onAddNew={hasPermission("hr.role.create") ? handleAddNew : null} onEdit={hasPermission("hr.role.edit") ? handleEdit : null} />;
}
