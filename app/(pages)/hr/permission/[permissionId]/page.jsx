"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UIPermissionForm from "@/module/hr/permission/UIPermissionForm";
import { LoadingState } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import {
  usePermission,
  useSubmitPermission,
} from "@/app/api/hr/permission/core";
import { useFormHandler, useMenu } from "@/hooks";

export default function PermissionUpdate() {
  const router = useRouter();
  const { hasPermission } = useMenu();

  const { permissionId } = useParams();
  const { userId: sessionUserId, userName } = useSessionUser();

  const { permission, loading: permissionLoading } =
    usePermission(permissionId);

  useEffect(() => {
    if (!hasPermission("permission.update")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const submitPermission = useSubmitPermission({
    mode: "update",
    permissionId,
    currentPermissionId: sessionUserId,
  });

  const formHandler = useFormHandler(
    {
      permissionName: "",
      permissionStatus: "",
    },
    submitPermission
  );

  useEffect(() => {
    if (permission) {
      formHandler.setFormData({
        permissionName: permission.permissionName || "",
        permissionStatus: permission.permissionStatus || "",
      });
    }
  }, [permission]);

  if (permissionLoading) return <LoadingState />;

  return (
    <UIPermissionForm
      formHandler={formHandler}
      mode="update"
      operatedBy={userName}
      isUpdate
    />
  );
}
