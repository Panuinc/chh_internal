"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UIPermission from "@/module/hr/permission/UIPermission";
import { usePermissions } from "@/app/(pages)/hr/_hooks/usePermission";
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

  return (
    <UIPermission
      Permissions={permissions}
      loading={loading}
      onAddNew={isSuperAdmin ? handleAddNew : null}
      onEdit={isSuperAdmin ? handleEdit : null}
    />
  );
}