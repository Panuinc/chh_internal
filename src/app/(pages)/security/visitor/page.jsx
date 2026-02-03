"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UIVisitor from "@/app/(pages)/security/_components/visitor/UIVisitor";
import { useVisitors } from "@/app/(pages)/security/_hooks/useVisitor";
import { useMenu } from "@/hooks";

export default function VisitorPage() {
  const router = useRouter();
  const { visitors, loading } = useVisitors();
  const { hasPermission } = useMenu();

  const handleAddNew = () => {
    if (!hasPermission("security.visitor.create")) return;
    router.push("/security/visitor/create");
  };

  const handleEdit = (item) => {
    if (!hasPermission("security.visitor.edit")) return;
    router.push(`/security/visitor/${item.visitorId}`);
  };

  return (
    <UIVisitor
      Visitors={visitors}
      loading={loading}
      onAddNew={hasPermission("security.visitor.create") ? handleAddNew : null}
      onEdit={hasPermission("security.visitor.edit") ? handleEdit : null}
    />
  );
}