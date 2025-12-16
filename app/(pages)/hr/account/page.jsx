"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UIAccount from "@/module/hr/account/UIAccount";
import { useAccounts } from "@/app/api/hr/account/core";
import { useMenu } from "@/hooks";

export default function AccountPage() {
  const router = useRouter();
  const { accounts, loading } = useAccounts();
  const { hasPermission } = useMenu();

  const handleAddNew = () => {
    if (!hasPermission("account.create")) return;
    router.push("/hr/account/create");
  };

  const handleEdit = (item) => {
    if (!hasPermission("account.update")) return;
    router.push(`/hr/account/${item.accountId}`);
  };

  return (
    <UIAccount
      Accounts={accounts}
      loading={loading}
      onAddNew={hasPermission("account.create") ? handleAddNew : null}
      onEdit={hasPermission("account.update") ? handleEdit : null}
    />
  );
}