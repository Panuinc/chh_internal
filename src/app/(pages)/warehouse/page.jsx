"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import UIWarehouse from "@/app/(pages)/warehouse/_components/UIWarehouse";

export default function Warehouse() {
  const { menu, isEmpty } = useModuleMenu("warehouse");

  return <UIWarehouse menu={menu} isEmpty={isEmpty} />;
}
