"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UIPermissionForm from "@/module/hr/permission/UIPermissionForm";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useSubmitPermission } from "@/app/(pages)/hr/_hooks/usePermission";
import { useFormHandler, useMenu } from "@/hooks";

export default function PermissionCreate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { userId, userName } = useSessionUser();

  useEffect(() => {
    if (!hasPermission("permission.create")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const submitPermission = useSubmitPermission({
    mode: "create",
    currentPermissionId: userId,
  });

  const formHandler = useFormHandler(
    {
      permissionName: "",
    },
    submitPermission
  );

  return (
    <UIPermissionForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
    />
  );
}
