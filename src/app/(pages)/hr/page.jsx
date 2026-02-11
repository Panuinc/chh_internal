"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import { HrDashboard } from "@/features/hr";

export default function Hr() {
  const { menu } = useModuleMenu("hr");

  return <HrDashboard menu={menu} />;
}
