"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UIPermissionForm from "@/app/(pages)/hr/_components/permission/UIPermissionForm";
import { Loading } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import {
  usePermission,
  useSubmitPermission,
} from "@/app/(pages)/hr/_hooks/usePermission";
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

  const { setFormData } = formHandler;

  useEffect(() => {
    if (permission) {
      setFormData({
        permissionName: permission.permissionName || "",
        permissionStatus: permission.permissionStatus || "",
      });
    }
  }, [permission, setFormData]);

  if (permissionLoading) return <Loading />;

  return (
    <UIPermissionForm
      formHandler={formHandler}
      mode="update"
      operatedBy={userName}
      isUpdate
    />
  );
}
