"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import UISales from "@/app/(pages)/sales/_components/UISales";

export default function Sales() {
  const { menu, isEmpty } = useModuleMenu("sales");

  return <UISales menu={menu} isEmpty={isEmpty} />;
}
