"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UIEmployeeForm from "@/module/hr/employee/UIEmployeeForm";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useSubmitEmployee } from "@/app/api/hr/employee/core";
import { useFormHandler, useMenu } from "@/hooks";

export default function EmployeeCreate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { userId, userName } = useSessionUser();

  useEffect(() => {
    if (!hasPermission("employee.create")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const submitEmployee = useSubmitEmployee({
    mode: "create",
    currentEmployeeId: userId,
  });

  const formHandler = useFormHandler(
    {
      employeeFirstName: "",
      employeeLastName: "",
      employeeEmail: "",
    },
    submitEmployee
  );

  return (
    <UIEmployeeForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
    />
  );
}
