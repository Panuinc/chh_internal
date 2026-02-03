"use client";

import { useModuleMenu } from "@/hooks/useMenu";
import UISecurity from "@/app/(pages)/security/_components/UISecurity";

export default function Security() {
  const { menu, isEmpty } = useModuleMenu("security");

  return <UISecurity menu={menu} isEmpty={isEmpty} />;
}
