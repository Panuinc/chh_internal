"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UIEmployeeForm from "@/module/hr/employee/UIEmployeeForm";
import { Loading } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useEmployee, useSubmitEmployee } from "@/app/(pages)/hr/_hooks/useEmployee";
import { useFormHandler, useMenu } from "@/hooks";

export default function EmployeeUpdate() {
  const router = useRouter();
  const { hasPermission } = useMenu();

  const { employeeId } = useParams();
  const { userId: sessionUserId, userName } = useSessionUser();

  const { employee, loading: employeeLoading } = useEmployee(employeeId);

  useEffect(() => {
    if (!hasPermission("hr.employee.edit")) {
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

  if (employeeLoading) return <Loading />;

  return (
    <UIEmployeeForm
      formHandler={formHandler}
      mode="update"
      operatedBy={userName}
      isUpdate
    />
  );
}
