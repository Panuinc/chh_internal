"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import UIHr from "@/module/hr/UIHr";

export default function Hr() {
  const { menu, isEmpty } = useModuleMenu("hr");

  return <UIHr menu={menu} isEmpty={isEmpty} />;
}
