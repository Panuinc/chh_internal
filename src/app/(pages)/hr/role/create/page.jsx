"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UIRoleForm from "@/app/(pages)/hr/_components/role/UIRoleForm";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useSubmitRole } from "@/app/(pages)/hr/_hooks/useRole";
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
    submitRole
  );

  return (
    <UIRoleForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
    />
  );
}
