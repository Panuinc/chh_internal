"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UIAccountForm from "@/module/hr/account/UIAccountForm";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useSubmitAccount } from "@/app/api/hr/account/core";
import { useEmployees } from "@/app/api/hr/employee/core";
import { useFormHandler, useMenu } from "@/hooks";

export default function AccountCreate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { userId, userName } = useSessionUser();
  const { employees } = useEmployees();

  useEffect(() => {
    if (!hasPermission("account.create")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const submitAccount = useSubmitAccount({
    mode: "create",
    currentEmployeeId: userId,
  });

  const formHandler = useFormHandler(
    {
      accountEmployeeId: "",
      accountUsername: "",
      accountPassword: "",
      accountPinNumber: "",
    },
    submitAccount
  );

  const availableEmployees = employees.filter(
    (emp) => emp.employeeStatus === "Active"
  );

  return (
    <UIAccountForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
      employees={availableEmployees}
    />
  );
}