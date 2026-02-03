"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import UIHr from "@/app/(pages)/hr/_components/UIHr";

export default function Hr() {
  const { menu, isEmpty } = useModuleMenu("hr");

  return <UIHr menu={menu} isEmpty={isEmpty} />;
}
