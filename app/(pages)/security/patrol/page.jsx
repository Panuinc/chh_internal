"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UIPatrol from "@/module/security/patrol/UIPatrol";
import { usePatrols } from "@/app/api/security/patrol/core";
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
    <UIPatrol
      Patrols={patrols}
      loading={loading}
      onAddNew={hasPermission("security.patrol.create") ? handleAddNew : null}
    />
  );
}