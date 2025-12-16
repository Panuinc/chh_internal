"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UIAccountForm from "@/module/hr/account/UIAccountForm";
import { LoadingState } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useAccount, useSubmitAccount } from "@/app/api/hr/account/core";
import { useFormHandler, useMenu } from "@/hooks";

export default function AccountUpdate() {
  const router = useRouter();
  const { hasPermission } = useMenu();

  const { accountId } = useParams();
  const { userId: sessionUserId, userName } = useSessionUser();

  const { account, loading: accountLoading } = useAccount(accountId);

  useEffect(() => {
    if (!hasPermission("account.update")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const submitAccount = useSubmitAccount({
    mode: "update",
    accountId,
    currentEmployeeId: sessionUserId,
  });

  const formHandler = useFormHandler(
    {
      accountUsername: "",
      accountPassword: "",
      accountPinNumber: "",
      accountStatus: "",
    },
    submitAccount
  );

  useEffect(() => {
    if (account) {
      formHandler.setFormData({
        accountUsername: account.accountUsername || "",
        accountPassword: "",
        accountPinNumber: "",
        accountStatus: account.accountStatus || "",
      });
    }
  }, [account]);

  if (accountLoading) return <LoadingState />;

  return (
    <UIAccountForm
      formHandler={formHandler}
      mode="update"
      operatedBy={userName}
      account={account}
      isUpdate
    />
  );
}