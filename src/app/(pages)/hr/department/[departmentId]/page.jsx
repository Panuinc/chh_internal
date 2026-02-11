"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DepartmentForm } from "@/features/hr";
import { Loading } from "@/components";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useDepartment, useSubmitDepartment } from "@/features/hr";
import { useFormHandler, useMenu } from "@/hooks";

export default function DepartmentUpdate() {
  const router = useRouter();
  const { hasPermission } = useMenu();

  const { departmentId } = useParams();
  const { userId: sessionUserId, userName } = useSessionUser();

  const { department, loading: departmentLoading } = useDepartment(departmentId);

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
    submitDepartment,
  );

  const { setFormData } = formHandler;

  useEffect(() => {
    if (department) {
      setFormData({
        departmentName: department.departmentName || "",
        departmentStatus: department.departmentStatus || "",
      });
    }
  }, [department, setFormData]);

  if (departmentLoading) return <Loading />;

  return <DepartmentForm formHandler={formHandler} mode="update" operatedBy={userName} isUpdate />;
}
