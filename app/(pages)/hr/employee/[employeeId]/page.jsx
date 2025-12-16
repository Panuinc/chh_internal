"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UIEmployeeForm from "@/module/hr/employee/UIEmployeeForm";
import { LoadingState } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useEmployee, useSubmitEmployee } from "@/app/api/hr/employee/core";
import { useFormHandler, useMenu } from "@/hooks";

export default function EmployeeUpdate() {
  const router = useRouter();
  const { hasPermission } = useMenu();

  const { employeeId } = useParams();
  const { userId: sessionUserId, userName } = useSessionUser();

  const { employee, loading: employeeLoading } = useEmployee(employeeId);

  useEffect(() => {
    if (!hasPermission("employee.update")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const submitEmployee = useSubmitEmployee({
    mode: "update",
    employeeId,
    currentEmployeeId: sessionUserId,
  });

  const formHandler = useFormHandler(
    {
      employeeFirstName: "",
      employeeLastName: "",
      employeeEmail: "",
      employeeStatus: "",
    },
    submitEmployee
  );

  useEffect(() => {
    if (employee) {
      formHandler.setFormData({
        employeeFirstName: employee.employeeFirstName || "",
        employeeLastName: employee.employeeLastName || "",
        employeeEmail: employee.employeeEmail || "",
        employeeStatus: employee.employeeStatus || "",
      });
    }
  }, [employee]);

  if (employeeLoading) return <LoadingState />;

  return (
    <UIEmployeeForm
      formHandler={formHandler}
      mode="update"
      operatedBy={userName}
      isUpdate
    />
  );
}
