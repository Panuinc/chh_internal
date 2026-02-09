"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AccountForm } from "@/features/hr";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useSubmitAccount, useEmployees } from "@/features/hr";
import { useFormHandler, useMenu } from "@/hooks";

export default function AccountCreate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { userId, userName } = useSessionUser();
  const { employees } = useEmployees(undefined, true); // fetchAll = true

  useEffect(() => {
    if (!hasPermission("hr.account.create")) {
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
    <AccountForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
      employees={availableEmployees}
    />
  );
}
