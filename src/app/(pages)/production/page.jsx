"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import UIProduction from "@/module/production/UIProduction";

export default function Production() {
  const { menu, isEmpty } = useModuleMenu("production");

  return <UIProduction menu={menu} isEmpty={isEmpty} />;
}
