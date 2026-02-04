"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UIRole from "@/app/(pages)/hr/_components/role/UIRole";
import { useRoles } from "@/app/(pages)/hr/_hooks/useRole";
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

  return (
    <UIRole
      Roles={roles}
      loading={loading}
      onAddNew={hasPermission("hr.role.create") ? handleAddNew : null}
      onEdit={hasPermission("hr.role.edit") ? handleEdit : null}
    />
  );
}
