"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PermissionForm } from "@/features/hr";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useSubmitPermission } from "@/features/hr";
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
    <PermissionForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
    />
  );
}
