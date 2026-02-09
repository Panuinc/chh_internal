"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import { SecurityDashboard } from "@/features/security";

export default function Security() {
  const { menu, isEmpty } = useModuleMenu("security");

  return <SecurityDashboard menu={menu} isEmpty={isEmpty} />;
}
