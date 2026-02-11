"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DepartmentForm } from "@/features/hr";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useSubmitDepartment } from "@/features/hr";
import { useFormHandler, useMenu } from "@/hooks";

export default function DepartmentCreate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { userId, userName } = useSessionUser();

  useEffect(() => {
    if (!hasPermission("hr.department.create")) {
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
    submitDepartment,
  );

  return <DepartmentForm formHandler={formHandler} mode="create" operatedBy={userName} />;
}
