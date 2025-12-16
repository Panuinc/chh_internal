"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import UIAssignForm from "@/module/hr/assign/UIAssignForm";
import { LoadingState } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useEmployee } from "@/app/api/hr/employee/core";
import { usePermissions } from "@/app/api/hr/permission/core";
import {
  useEmployeeAssigns,
  useSyncAssigns,
  groupPermissionsByCategory,
} from "@/app/api/hr/assign/core";
import { useMenu } from "@/hooks";

export default function AssignUpdate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { employeeId } = useParams();
  const { userId: sessionUserId, userName } = useSessionUser();

  const { employee, loading: employeeLoading } = useEmployee(employeeId);

  const { permissions: allPermissions, loading: permissionsLoading } =
    usePermissions();

  const { assignedPermissionIds, loading: assignsLoading } =
    useEmployeeAssigns(employeeId);

  const [selectedIds, setSelectedIds] = useState(new Set());

  const initializedRef = useRef(false);

  const { syncPermissions, saving } = useSyncAssigns({
    employeeId,
    currentUserId: sessionUserId,
  });

  useEffect(() => {
    if (!hasPermission("assign.update")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  useEffect(() => {
    if (
      !assignsLoading &&
      !initializedRef.current &&
      assignedPermissionIds.length > 0
    ) {
      setSelectedIds(new Set(assignedPermissionIds));
      initializedRef.current = true;
    }
  }, [assignsLoading, assignedPermissionIds]);

  const activePermissions = allPermissions.filter(
    (p) => p.permissionStatus === "Active"
  );
  const groupedPermissions = groupPermissionsByCategory(activePermissions);

  const handleToggle = (permissionId) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handleToggleCategory = (categoryPermissions, isAllSelected) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      categoryPermissions.forEach((p) => {
        if (isAllSelected) {
          newSet.delete(p.permissionId);
        } else {
          newSet.add(p.permissionId);
        }
      });
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = activePermissions.map((p) => p.permissionId);
    setSelectedIds(new Set(allIds));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleSubmit = () => {
    syncPermissions(selectedIds);
  };

  const isLoading = employeeLoading || permissionsLoading || assignsLoading;

  if (isLoading) return <LoadingState />;

  return (
    <UIAssignForm
      employee={employee}
      groupedPermissions={groupedPermissions}
      selectedIds={selectedIds}
      onToggle={handleToggle}
      onToggleCategory={handleToggleCategory}
      onSelectAll={handleSelectAll}
      onDeselectAll={handleDeselectAll}
      onSubmit={handleSubmit}
      saving={saving}
      operatedBy={userName}
    />
  );
}
