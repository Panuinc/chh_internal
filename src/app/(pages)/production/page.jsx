"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import { ProductionDashboard } from "@/features/production";

export default function Production() {
  const { menu, isEmpty } = useModuleMenu("production");

  return <ProductionDashboard menu={menu} isEmpty={isEmpty} />;
}
