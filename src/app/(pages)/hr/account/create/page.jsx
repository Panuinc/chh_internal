"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UIAccountForm from "@/app/(pages)/hr/_components/account/UIAccountForm";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useSubmitAccount } from "@/app/(pages)/hr/_hooks/useAccount";
import { useEmployees } from "@/app/(pages)/hr/_hooks/useEmployee";
import { useFormHandler, useMenu } from "@/hooks";

export default function AccountCreate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { userId, userName } = useSessionUser();
  const { employees } = useEmployees();

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
    <UIAccountForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
      employees={availableEmployees}
    />
  );
}