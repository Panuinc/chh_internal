"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EmployeeForm } from "@/features/hr";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useSubmitEmployee, useDepartments, useRoles } from "@/features/hr";
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

  const { departments } = useDepartments(undefined, true); // fetchAll = true
  const { roles } = useRoles(undefined, true); // fetchAll = true

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
    <EmployeeForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
      departments={departments}
      roles={roles}
    />
  );
}
