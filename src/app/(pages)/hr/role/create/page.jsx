"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoleForm } from "@/features/hr";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useSubmitRole } from "@/features/hr";
import { useFormHandler, useMenu } from "@/hooks";

export default function RoleCreate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { userId, userName } = useSessionUser();

  useEffect(() => {
    if (!hasPermission("hr.role.create")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const submitRole = useSubmitRole({
    mode: "create",
    currentRoleId: userId,
  });

  const formHandler = useFormHandler(
    {
      roleName: "",
    },
    submitRole,
  );

  return <RoleForm formHandler={formHandler} mode="create" operatedBy={userName} />;
}
