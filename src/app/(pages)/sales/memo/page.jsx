"use client";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MemoList, useMemos, useApproveMemo, useRejectMemo, MemoRejectModal } from "@/features/sales";
import { useMenu } from "@/hooks";
import { PermissionDenied } from "@/components";

export default function MemoPage() {
  const router = useRouter();
  const { memos, loading, refetch } = useMemos();
  const { hasPermission } = useMenu();
  const approveMemo = useApproveMemo();
  const rejectMemo = useRejectMemo();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const canApproveSM = hasPermission("sales.memo.approve.salesmanager") || hasPermission("superadmin");
  const canApproveCEO = hasPermission("sales.memo.approve.ceo") || hasPermission("superadmin");

  const handleAddNew = () => {
    if (!hasPermission("sales.memo.create")) return;
    router.push("/sales/memo/create");
  };

  const handleEdit = (item) => {
    if (!hasPermission("sales.memo.edit")) return;
    router.push(`/sales/memo/${item.memoId}`);
  };

  const handleView = (item) => {
    router.push(`/sales/memo/${item.memoId}`);
  };

  const handleApprove = useCallback(async (item) => {
    const result = await approveMemo(item.memoId);
    if (result.success) {
      refetch?.();
    }
  }, [approveMemo, refetch]);

  const handleRejectClick = useCallback((item) => {
    setSelectedMemo(item);
    setRejectReason("");
    setRejectModalOpen(true);
  }, []);

  const handleRejectConfirm = useCallback(async () => {
    if (!selectedMemo || !rejectReason.trim()) return;
    
    const result = await rejectMemo(selectedMemo.memoId, rejectReason);
    if (result.success) {
      setRejectModalOpen(false);
      setSelectedMemo(null);
      setRejectReason("");
      refetch?.();
    }
  }, [selectedMemo, rejectReason, rejectMemo, refetch]);

  if (!hasPermission("sales.memo.view")) {
    return <PermissionDenied />;
  }

  return (
    <>
      <MemoList
        Memos={memos}
        loading={loading}
        onAddNew={hasPermission("sales.memo.create") ? handleAddNew : null}
        onEdit={hasPermission("sales.memo.edit") ? handleEdit : null}
        onView={handleView}
        onApprove={(canApproveSM || canApproveCEO) ? handleApprove : null}
        onReject={(canApproveSM || canApproveCEO) ? handleRejectClick : null}
        canApproveSM={canApproveSM}
        canApproveCEO={canApproveCEO}
      />

      <MemoRejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        rejectReason={rejectReason}
        onReasonChange={setRejectReason}
        onConfirm={handleRejectConfirm}
      />
    </>
  );
}
