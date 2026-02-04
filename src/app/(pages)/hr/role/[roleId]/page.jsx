"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UIRoleForm from "@/app/(pages)/hr/_components/role/UIRoleForm";
import { Loading } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import {
  useRole,
  useSubmitRole,
} from "@/app/(pages)/hr/_hooks/useRole";
import { useFormHandler, useMenu } from "@/hooks";

export default function RoleUpdate() {
  const router = useRouter();
  const { hasPermission } = useMenu();

  const { roleId } = useParams();
  const { userId: sessionUserId, userName } = useSessionUser();

  const { role, loading: roleLoading } = useRole(roleId);

  useEffect(() => {
    if (!hasPermission("hr.role.edit")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const submitRole = useSubmitRole({
    mode: "update",
    roleId,
    currentRoleId: sessionUserId,
  });

  const formHandler = useFormHandler(
    {
      roleName: "",
      roleStatus: "",
    },
    submitRole
  );

  const { setFormData } = formHandler;

  useEffect(() => {
    if (role) {
      setFormData({
        roleName: role.roleName || "",
        roleStatus: role.roleStatus || "",
      });
    }
  }, [role, setFormData]);

  if (roleLoading) return <Loading />;

  return (
    <UIRoleForm
      formHandler={formHandler}
      mode="update"
      operatedBy={userName}
      isUpdate
    />
  );
}
