"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { PatrolList, usePatrols } from "@/features/security";
import { useMenu } from "@/hooks";

export default function PatrolPage() {
  const router = useRouter();
  const { patrols, loading } = usePatrols();
  const { hasPermission } = useMenu();

  const handleAddNew = () => {
    if (!hasPermission("security.patrol.create")) return;
    router.push("/security/patrol/create");
  };

  return (
    <PatrolList
      Patrols={patrols}
      loading={loading}
      onAddNew={hasPermission("security.patrol.create") ? handleAddNew : null}
    />
  );
}