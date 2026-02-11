"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { PermissionList, usePermissions } from "@/features/hr";
import { useMenu } from "@/hooks";

export default function PermissionPage() {
  const router = useRouter();
  const { permissions, loading } = usePermissions();
  const { isSuperAdmin } = useMenu();

  const handleAddNew = () => {
    router.push("/hr/permission/create");
  };

  const handleEdit = (item) => {
    router.push(`/hr/permission/${item.permissionId}`);
  };

  return <PermissionList Permissions={permissions} loading={loading} onAddNew={isSuperAdmin ? handleAddNew : null} onEdit={isSuperAdmin ? handleEdit : null} />;
}
