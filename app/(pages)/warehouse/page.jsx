"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import UIWarehouse from "@/module/warehouse/UIWarehouse";

export default function Warehouse() {
  const { menu, isEmpty } = useModuleMenu("warehouse");

  return <UIWarehouse menu={menu} isEmpty={isEmpty} />;
}
