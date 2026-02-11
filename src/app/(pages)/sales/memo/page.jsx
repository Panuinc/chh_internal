"use client";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MemoList, useMemos, useApproveMemo, useRejectMemo } from "@/features/sales";
import { useMenu } from "@/hooks";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";

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

  // DEBUG: Check permission values
  console.log("=== MEMO PAGE DEBUG ===");
  console.log("canApproveSM:", canApproveSM);
  console.log("canApproveCEO:", canApproveCEO);
  console.log("Memos count:", memos?.length);
  console.log("All memos:", memos?.map(m => ({ 
    id: m.memoId, 
    docNo: m.memoDocumentNo, 
    status: m.memoStatus,
    statusLabel: m.memoStatusLabel 
  })));
  console.log("Pending SM memos:", memos?.filter(m => m.memoStatus === "PENDING_SALES_MANAGER").length);
  console.log("Pending CEO memos:", memos?.filter(m => m.memoStatus === "PENDING_CEO").length);
  console.log("=======================");

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
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-danger">
          You do not have permission to access this page
        </p>
      </div>
    );
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

      {/* Reject Reason Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Specify Rejection Reason</ModalHeader>
          <ModalBody>
            <Textarea
              placeholder="Please specify the reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              minRows={3}
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleRejectConfirm}
              isDisabled={!rejectReason.trim()}
            >
              Reject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
