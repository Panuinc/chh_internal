"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import UIAssignForm from "@/app/(pages)/hr/_components/assign/UIAssignForm";
import { Loading } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useEmployee } from "@/app/(pages)/hr/_hooks/useEmployee";
import { usePermissions } from "@/app/(pages)/hr/_hooks/usePermission";
import {
  useEmployeeAssigns,
  useSyncAssigns,
  groupPermissionsByCategory,
} from "@/app/(pages)/hr/_hooks/useAssign";
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

  // Initialize selectedIds from assignedPermissionIds using lazy initialization
  const [selectedIds, setSelectedIds] = useState(() => {
    if (assignedPermissionIds && assignedPermissionIds.length > 0) {
      return new Set(assignedPermissionIds);
    }
    return new Set();
  });

  // Update selectedIds when assignedPermissionIds changes (but not during editing)
  const [isEditing, setIsEditing] = useState(false);
  const prevAssignedIdsRef = useRef(assignedPermissionIds);

  useEffect(() => {
    if (!hasPermission("assign.update")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  // Sync with server data only when not editing and data actually changes
  useEffect(() => {
    if (
      !assignsLoading &&
      !isEditing &&
      assignedPermissionIds !== prevAssignedIdsRef.current
    ) {
      const hasChanged = 
        assignedPermissionIds.length !== prevAssignedIdsRef.current?.length ||
        !assignedPermissionIds.every(id => prevAssignedIdsRef.current?.includes(id));
      
      if (hasChanged) {
        // Schedule to avoid synchronous setState
        setTimeout(() => {
          setSelectedIds(new Set(assignedPermissionIds));
          prevAssignedIdsRef.current = assignedPermissionIds;
        }, 0);
      }
    }
  }, [assignsLoading, assignedPermissionIds, isEditing]);

  const activePermissions = allPermissions.filter(
    (p) => p.permissionStatus === "Active"
  );
  const groupedPermissions = groupPermissionsByCategory(activePermissions);

  const handleToggle = (permissionId) => {
    setIsEditing(true);
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
    setIsEditing(true);
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
    setIsEditing(true);
    const allIds = activePermissions.map((p) => p.permissionId);
    setSelectedIds(new Set(allIds));
  };

  const handleDeselectAll = () => {
    setIsEditing(true);
    setSelectedIds(new Set());
  };

  const handleSubmit = () => {
    syncPermissions(selectedIds);
    setIsEditing(false);
    prevAssignedIdsRef.current = Array.from(selectedIds);
  };

  const isLoading = employeeLoading || permissionsLoading || assignsLoading;

  if (isLoading) return <Loading />;

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
