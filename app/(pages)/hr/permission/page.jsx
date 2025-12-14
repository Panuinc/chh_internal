"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UIPermission from "@/module/hr/permission/UIPermission";
import { usePermissions } from "@/app/api/hr/permission/core";
import { useMenu } from "@/hooks";

export default function PermissionPage() {
  const router = useRouter();
  const { permissions, loading } = usePermissions();
  const { hasPermission } = useMenu();

  const handleAddNew = () => {
    if (!hasPermission("permission.create")) return;
    router.push("/hr/permission/create");
  };

  const handleEdit = (item) => {
    if (!hasPermission("permission.update")) return;
    router.push(`/hr/permission/${item.permissionId}`);
  };

  return (
    <UIPermission
      headerTopic="Permission"
      Permissions={permissions}
      loading={loading}
      onAddNew={hasPermission("permission.create") ? handleAddNew : null}
      onEdit={hasPermission("permission.update") ? handleEdit : null}
    />
  );
}