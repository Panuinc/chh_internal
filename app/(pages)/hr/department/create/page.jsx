"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UIDepartmentForm from "@/module/hr/department/UIDepartmentForm";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useSubmitDepartment } from "@/app/api/hr/department/core";
import { useFormHandler, useMenu } from "@/hooks";

export default function DepartmentCreate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { userId, userName } = useSessionUser();

  useEffect(() => {
    if (!hasPermission("department.create")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const submitDepartment = useSubmitDepartment({
    mode: "create",
    currentDepartmentId: userId,
  });

  const formHandler = useFormHandler(
    {
      departmentName: "",
    },
    submitDepartment
  );

  return (
    <UIDepartmentForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
    />
  );
}
