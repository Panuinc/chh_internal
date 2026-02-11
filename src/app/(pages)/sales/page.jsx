"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import { SalesDashboard } from "@/features/sales";

export default function Sales() {
  const { menu } = useModuleMenu("sales");

  return <SalesDashboard menu={menu} />;
}
