"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import { WarehouseDashboard } from "@/features/warehouse";

export default function Warehouse() {
  const { menu, isEmpty } = useModuleMenu("warehouse");

  return <WarehouseDashboard menu={menu} isEmpty={isEmpty} />;
}
