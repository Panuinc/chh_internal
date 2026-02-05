"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import UIMemoForm from "@/app/(pages)/sales/_components/memo/UIMemoForm";
import { Loading } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import {
  useMemo,
  useSubmitMemo,
  useApproveMemo,
  useRejectMemo,
} from "@/app/(pages)/sales/_hooks/useMemo";
import { useFormHandler, useMenu } from "@/hooks";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@heroui/react";

// Helper to format Date to YYYY-MM-DD
function formatDateForInput(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export default function MemoUpdate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { memoId } = useParams();
  const { userId: sessionUserId, userName } = useSessionUser();

  const { memo, loading: memoLoading, refetch } = useMemo(memoId);
  const approveMemo = useApproveMemo();
  const rejectMemo = useRejectMemo();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const canEdit = hasPermission("sales.memo.edit");
  const canApproveSM = hasPermission("sales.memo.approve.salesmanager") || hasPermission("superadmin");
  const canApproveCEO = hasPermission("sales.memo.approve.ceo") || hasPermission("superadmin");

  const submitMemo = useSubmitMemo({
    mode: "update",
    memoId,
    currentEmployeeId: sessionUserId,
  });

  const formHandler = useFormHandler(
    {
      documentNo: "",
      to: "",
      copy: "",
      subject: "",
      date: "",
      content: "",
      requesterName: "",
      requesterDate: "",
      status: "DRAFT",
    },
    submitMemo
  );

  const { setFormData } = formHandler;

  useEffect(() => {
    if (memo) {
      setFormData({
        documentNo: memo.memoDocumentNo || "",
        to: memo.memoTo || "",
        copy: memo.memoCopy || "",
        subject: memo.memoSubject || "",
        date: formatDateForInput(memo.memoDate),
        content: memo.memoContent || "",
        requesterName: memo.memoRequesterName || "",
        requesterDate: formatDateForInput(memo.memoRequesterDate),
        status: memo.memoStatus || "DRAFT",
      });
    }
  }, [memo, setFormData]);

  const handleSubmitForApproval = useCallback(async () => {
    // Update status to PENDING_SALES_MANAGER
    const updatedFormData = {
      ...formHandler.formData,
      status: "PENDING_SALES_MANAGER",
      updatedBy: sessionUserId,
    };
    
    // Submit the form with new status
    await formHandler.handleSubmit({ preventDefault: () => {} });
  }, [formHandler, sessionUserId]);

  const handleApprove = useCallback(async () => {
    const result = await approveMemo(memoId);
    if (result.success) {
      refetch?.();
    }
  }, [approveMemo, memoId, refetch]);

  const handleReject = useCallback(async () => {
    if (!rejectReason.trim()) {
      setRejectModalOpen(true);
      return;
    }
    
    const result = await rejectMemo(memoId, rejectReason);
    if (result.success) {
      setRejectModalOpen(false);
      setRejectReason("");
      refetch?.();
    }
  }, [rejectMemo, memoId, rejectReason, refetch]);

  const handleRejectConfirm = useCallback(async () => {
    if (!rejectReason.trim()) return;
    
    const result = await rejectMemo(memoId, rejectReason);
    if (result.success) {
      setRejectModalOpen(false);
      setRejectReason("");
      refetch?.();
    }
  }, [rejectMemo, memoId, rejectReason, refetch]);

  if (memoLoading) return <Loading />;

  const status = memo?.memoStatus || "DRAFT";
  const isReadOnly = status === "APPROVED";
  const canEditMemo = canEdit && (status === "DRAFT" || status === "REJECTED");

  return (
    <>
      <UIMemoForm
        formHandler={formHandler}
        mode="update"
        operatedBy={userName}
        isUpdate
        memo={memo}
        onSubmitForApproval={canEditMemo ? handleSubmitForApproval : null}
        onApprove={
          (status === "PENDING_SALES_MANAGER" && canApproveSM) ||
          (status === "PENDING_CEO" && canApproveCEO)
            ? handleApprove
            : null
        }
        onReject={
          (status === "PENDING_SALES_MANAGER" && canApproveSM) ||
          (status === "PENDING_CEO" && canApproveCEO)
            ? () => setRejectModalOpen(true)
            : null
        }
        canApproveSM={canApproveSM}
        canApproveCEO={canApproveCEO}
        isReadOnly={isReadOnly || !canEditMemo}
      />

      {/* Reject Reason Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)}>
        <ModalContent>
          <ModalHeader>ระบุเหตุผลการปฏิเสธ</ModalHeader>
          <ModalBody>
            <Textarea
              placeholder="กรุณาระบุเหตุผลการปฏิเสธ..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              minRows={3}
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={() => setRejectModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button 
              color="danger" 
              onPress={handleRejectConfirm}
              isDisabled={!rejectReason.trim()}
            >
              ปฏิเสธ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
