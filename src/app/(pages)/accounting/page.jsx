"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import { AccountingDashboard } from "@/features/accounting";

export default function Accounting() {
  const { menu } = useModuleMenu("accounting");

  return <AccountingDashboard menu={menu} />;
}
