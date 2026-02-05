"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UIEmployeeForm from "@/app/(pages)/hr/_components/employee/UIEmployeeForm";
import { Loading } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useEmployee, useSubmitEmployee } from "@/app/(pages)/hr/_hooks/useEmployee";
import { useDepartments } from "@/app/(pages)/hr/_hooks/useDepartment";
import { useRoles } from "@/app/(pages)/hr/_hooks/useRole";
import { useFormHandler, useMenu } from "@/hooks";

export default function EmployeeUpdate() {
  const router = useRouter();
  const { hasPermission } = useMenu();

  const { employeeId } = useParams();
  const { userId: sessionUserId, userName } = useSessionUser();

  const { employee, loading: employeeLoading } = useEmployee(employeeId);
  const { departments } = useDepartments(undefined, true); // fetchAll = true
  const { roles } = useRoles(undefined, true); // fetchAll = true

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
      employeeDepartmentId: "",
      employeeRoleId: "",
    },
    submitEmployee
  );

  const { setFormData } = formHandler;

  useEffect(() => {
    if (employee) {
      setFormData({
        employeeFirstName: employee.employeeFirstName || "",
        employeeLastName: employee.employeeLastName || "",
        employeeEmail: employee.employeeEmail || "",
        employeeStatus: employee.employeeStatus || "",
        employeeDepartmentId: employee.employeeDepartmentId || "",
        employeeRoleId: employee.employeeRoleId || "",
      });
    }
  }, [employee, setFormData]);

  if (employeeLoading) return <Loading />;

  return (
    <UIEmployeeForm
      formHandler={formHandler}
      mode="update"
      operatedBy={userName}
      isUpdate
      departments={departments}
      roles={roles}
    />
  );
}
