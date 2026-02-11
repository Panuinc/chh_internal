"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import { WarehouseDashboard } from "@/features/warehouse";

export default function Warehouse() {
  const { menu } = useModuleMenu("warehouse");

  return <WarehouseDashboard menu={menu} />;
}
