"use client";

import { useState, useMemo, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePermission } from "@/module/hr/permission";
import { UIPermission } from "@/module/hr/permission";

export default function PermissionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.isSuperAdmin) {
      router.replace("/forbidden");
    }
  }, [session, status, router]);

  const {
    permissions,
    isLoading,
    fetchPermissions,
    deletePermission,
    permissionCount,
  } = usePermission();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredPermissions = useMemo(() => {
    if (!searchTerm) return permissions;
    return permissions.filter((perm) =>
      perm.permName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [permissions, searchTerm]);

  const handleDelete = async (permId, permName) => {
    if (permName === "superAdmin") return;
    if (!confirm(`Do you want to delete the permission "${permName}"?`)) return;

    const result = await deletePermission(permId);
    if (result.success) {
      fetchPermissions();
    }
  };

  if (status === "loading" || !session?.user?.isSuperAdmin) {
    return null;
  }

  return (
    <UIPermission
      permissions={filteredPermissions}
      permissionCount={permissionCount}
      isLoading={isLoading}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      onRefresh={fetchPermissions}
      onDelete={handleDelete}
    />
  );
}
