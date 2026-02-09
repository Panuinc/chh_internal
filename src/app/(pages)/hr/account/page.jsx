"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { AccountList, useAccounts } from "@/features/hr";
import { useMenu } from "@/hooks";

export default function AccountPage() {
  const router = useRouter();
  const { accounts, loading } = useAccounts();
  const { hasPermission } = useMenu();

  const handleAddNew = () => {
    if (!hasPermission("hr.account.create")) return;
    router.push("/hr/account/create");
  };

  const handleEdit = (item) => {
    if (!hasPermission("hr.account.edit")) return;
    router.push(`/hr/account/${item.accountId}`);
  };

  return (
    <AccountList
      Accounts={accounts}
      loading={loading}
      onAddNew={hasPermission("hr.account.create") ? handleAddNew : null}
      onEdit={hasPermission("hr.account.edit") ? handleEdit : null}
    />
  );
}