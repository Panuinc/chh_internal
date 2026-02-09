"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import { SalesDashboard } from "@/features/sales";

export default function Sales() {
  const { menu, isEmpty } = useModuleMenu("sales");

  return <SalesDashboard menu={menu} isEmpty={isEmpty} />;
}
