"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UIDepartmentForm from "@/module/hr/department/UIDepartmentForm";
import { LoadingState } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import {
  useDepartment,
  useSubmitDepartment,
} from "@/app/api/hr/department/core";
import { useFormHandler, useMenu } from "@/hooks";

export default function DepartmentUpdate() {
  const router = useRouter();
  const { hasPermission } = useMenu();

  const { departmentId } = useParams();
  const { userId: sessionUserId, userName } = useSessionUser();

  const { department, loading: departmentLoading } =
    useDepartment(departmentId);

  useEffect(() => {
    if (!hasPermission("hr.department.edit")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const submitDepartment = useSubmitDepartment({
    mode: "update",
    departmentId,
    currentDepartmentId: sessionUserId,
  });

  const formHandler = useFormHandler(
    {
      departmentName: "",
      departmentStatus: "",
    },
    submitDepartment
  );

  useEffect(() => {
    if (department) {
      formHandler.setFormData({
        departmentName: department.departmentName || "",
        departmentStatus: department.departmentStatus || "",
      });
    }
  }, [department]);

  if (departmentLoading) return <LoadingState />;

  return (
    <UIDepartmentForm
      formHandler={formHandler}
      mode="update"
      operatedBy={userName}
      isUpdate
    />
  );
}
