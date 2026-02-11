"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import { SecurityDashboard } from "@/features/security";

export default function Security() {
  const { menu } = useModuleMenu("security");

  return <SecurityDashboard menu={menu} />;
}
