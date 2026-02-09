"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AccountForm } from "@/features/hr";
import { Loading } from "@/components";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useAccount, useSubmitAccount } from "@/features/hr";
import { useFormHandler, useMenu } from "@/hooks";

export default function AccountUpdate() {
  const router = useRouter();
  const { hasPermission } = useMenu();

  const { accountId } = useParams();
  const { userId: sessionUserId, userName } = useSessionUser();

  const { account, loading: accountLoading } = useAccount(accountId);

  useEffect(() => {
    if (!hasPermission("hr.account.edit")) {
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

  const { setFormData } = formHandler;

  useEffect(() => {
    if (account) {
      setFormData({
        accountUsername: account.accountUsername || "",
        accountPassword: "",
        accountPinNumber: "",
        accountStatus: account.accountStatus || "",
      });
    }
  }, [account, setFormData]);

  if (accountLoading) return <Loading />;

  return (
    <AccountForm
      formHandler={formHandler}
      mode="update"
      operatedBy={userName}
      account={account}
      isUpdate
    />
  );
}