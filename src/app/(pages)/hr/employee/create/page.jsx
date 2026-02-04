"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UIEmployeeForm from "@/app/(pages)/hr/_components/employee/UIEmployeeForm";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useSubmitEmployee } from "@/app/(pages)/hr/_hooks/useEmployee";
import { useDepartments } from "@/app/(pages)/hr/_hooks/useDepartment";
import { useRoles } from "@/app/(pages)/hr/_hooks/useRole";
import { useFormHandler, useMenu } from "@/hooks";

export default function EmployeeCreate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { userId, userName } = useSessionUser();

  useEffect(() => {
    if (!hasPermission("hr.employee.create")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const { departments } = useDepartments();
  const { roles } = useRoles();

  const submitEmployee = useSubmitEmployee({
    mode: "create",
    currentEmployeeId: userId,
  });

  const formHandler = useFormHandler(
    {
      employeeFirstName: "",
      employeeLastName: "",
      employeeEmail: "",
      employeeDepartmentId: "",
      employeeRoleId: "",
    },
    submitEmployee
  );

  return (
    <UIEmployeeForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
      departments={departments}
      roles={roles}
    />
  );
}
