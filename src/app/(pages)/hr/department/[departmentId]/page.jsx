"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UIDepartmentForm from "@/app/(pages)/hr/_components/department/UIDepartmentForm";
import { Loading } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import {
  useDepartment,
  useSubmitDepartment,
} from "@/app/(pages)/hr/_hooks/useDepartment";
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

  if (departmentLoading) return <Loading />;

  return (
    <UIDepartmentForm
      formHandler={formHandler}
      mode="update"
      operatedBy={userName}
      isUpdate
    />
  );
}
