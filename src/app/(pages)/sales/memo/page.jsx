"use client";
import React from "react";
import { useRouter } from "next/navigation";
import UIMemo from "@/app/(pages)/sales/_components/memo/UIMemo";
import { useMemos } from "@/app/(pages)/sales/_hooks/useMemo";
import { useMenu } from "@/hooks";

export default function MemoPage() {
  const router = useRouter();
  const { memos, loading } = useMemos();
  const { hasPermission } = useMenu();

  const handleAddNew = () => {
    if (!hasPermission("sales.memo.create")) return;
    router.push("/sales/memo/create");
  };

  const handleEdit = (item) => {
    if (!hasPermission("sales.memo.edit")) return;
    router.push(`/sales/memo/${item.memoId}`);
  };

  if (!hasPermission("sales.memo.view")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-danger">
          You do not have permission to access this page
        </p>
      </div>
    );
  }

  return (
    <UIMemo
      Memos={memos}
      loading={loading}
      onAddNew={hasPermission("sales.memo.create") ? handleAddNew : null}
      onEdit={hasPermission("sales.memo.edit") ? handleEdit : null}
    />
  );
}
