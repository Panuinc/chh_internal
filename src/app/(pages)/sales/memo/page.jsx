"use client";

import React, { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MemoList,
  MemoForm,
  MemoRejectModal,
  useMemos,
  useMemoItem,
  useSubmitMemo,
  useApproveMemo,
  useRejectMemo,
  useNextDocumentNo,
} from "@/features/sales";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useFormHandler, useMenu } from "@/hooks";
import { Loading, PermissionDenied } from "@/components";
import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";

function formatDateForInput(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function MemoPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = useMenu();
  const { userId, userName } = useSessionUser();

  const mode = searchParams.get("mode") || "list";
  const memoId = searchParams.get("id");

  const {
    memos,
    loading: listLoading,
    refetch: refetchList,
  } = useMemos();

  const { documentNo, loading: docNoLoading } = useNextDocumentNo();

  const { memo, loading: memoLoading, refetch: refetchMemo } = useMemoItem(memoId);

  const approveMemo = useApproveMemo();
  const rejectMemo = useRejectMemo();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const canCreate = hasPermission("sales.memo.create");
  const canEdit = hasPermission("sales.memo.edit");
  const canView = hasPermission("sales.memo.view");
  const canApproveSM =
    hasPermission("sales.memo.approve.salesmanager") ||
    hasPermission("superadmin");
  const canApproveCEO =
    hasPermission("sales.memo.approve.ceo") || hasPermission("superadmin");

  const navigateTo = useCallback(
    (newMode, newId = null) => {
      const params = new URLSearchParams();
      if (newMode !== "list") params.set("mode", newMode);
      if (newId) params.set("id", newId);
      const query = params.toString();
      router.push(`/sales/memo${query ? `?${query}` : ""}`);
    },
    [router]
  );

  const triggerRefresh = useCallback(() => {
    refetchList?.();
    if (memoId) refetchMemo?.();
  }, [refetchList, refetchMemo, memoId]);

  const submitMemoCreate = useSubmitMemo({
    mode: "create",
    currentEmployeeId: userId,
  });

  const today = new Date().toISOString().split("T")[0];

  const createFormHandler = useFormHandler(
    {
      documentNo: documentNo || "",
      to: "คุณจงคม ชูชัยศรี",
      copy: "คุณนวพล ชูเกียรติ",
      subject: "",
      date: today,
      content: "",
      requesterName: userName,
      requesterDate: today,
      status: "DRAFT",
    },
    submitMemoCreate
  );

  React.useEffect(() => {
    if (documentNo && mode === "create") {
      createFormHandler.setFormData((prev) => ({
        ...prev,
        documentNo: documentNo,
        requesterName: userName,
      }));
    }
  }, [documentNo, userName, mode, createFormHandler.setFormData]);

  const submitMemoUpdate = useSubmitMemo({
    mode: "update",
    memoId,
    currentEmployeeId: userId,
  });

  const updateFormHandler = useFormHandler(
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
    submitMemoUpdate
  );

  React.useEffect(() => {
    if (memo && mode === "view") {
      updateFormHandler.setFormData({
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
  }, [memo, mode, updateFormHandler.setFormData]);

  const handleAddNew = useCallback(() => {
    if (!canCreate) return;
    navigateTo("create");
  }, [canCreate, navigateTo]);

  const handleEdit = useCallback(
    (item) => {
      if (!canEdit) return;
      navigateTo("view", item.memoId);
    },
    [canEdit, navigateTo]
  );

  const handleView = useCallback(
    (item) => {
      navigateTo("view", item.memoId);
    },
    [navigateTo]
  );

  const handleApproveList = useCallback(
    async (item) => {
      const result = await approveMemo(item.memoId);
      if (result.success) {
        triggerRefresh();
      }
    },
    [approveMemo, triggerRefresh]
  );

  const handleRejectClickList = useCallback((item) => {
    setSelectedMemo(item);
    setRejectReason("");
    setRejectModalOpen(true);
  }, []);

  const handleRejectConfirmList = useCallback(async () => {
    if (!selectedMemo || !rejectReason.trim()) return;

    const result = await rejectMemo(selectedMemo.memoId, rejectReason);
    if (result.success) {
      setRejectModalOpen(false);
      setSelectedMemo(null);
      setRejectReason("");
      triggerRefresh();
    }
  }, [selectedMemo, rejectReason, rejectMemo, triggerRefresh]);

  const handleSubmitForApprovalCreate = useCallback(async () => {
    const submitData = {
      ...createFormHandler.formData,
      status: "PENDING_SALES_MANAGER",
      createdBy: userId,
    };
    const result = await submitMemoCreate(null, submitData, createFormHandler.setErrors);
    if (result?.success) {
      triggerRefresh();
      navigateTo("list");
    }
  }, [
    createFormHandler.formData,
    createFormHandler.setErrors,
    userId,
    submitMemoCreate,
    triggerRefresh,
    navigateTo,
  ]);

  const handleSubmitForApprovalUpdate = useCallback(async () => {
    const submitData = {
      ...updateFormHandler.formData,
      status: "PENDING_SALES_MANAGER",
      updatedBy: userId,
    };
    const result = await submitMemoUpdate(null, submitData, updateFormHandler.setErrors);
    if (result?.success) {
      triggerRefresh();
    }
  }, [
    updateFormHandler.formData,
    updateFormHandler.setErrors,
    userId,
    submitMemoUpdate,
    triggerRefresh,
  ]);

  const handleApproveView = useCallback(async () => {
    if (!memoId) return;
    const result = await approveMemo(memoId);
    if (result.success) {
      triggerRefresh();
    }
  }, [approveMemo, memoId, triggerRefresh]);

  const handleRejectClickView = useCallback(() => {
    if (!memoId) return;
    setSelectedMemo({ memoId });
    setRejectReason("");
    setRejectModalOpen(true);
  }, [memoId]);

  const handleRejectConfirmView = useCallback(async () => {
    if (!memoId || !rejectReason.trim()) return;

    const result = await rejectMemo(memoId, rejectReason);
    if (result.success) {
      setRejectModalOpen(false);
      setSelectedMemo(null);
      setRejectReason("");
      triggerRefresh();
    }
  }, [rejectMemo, memoId, rejectReason, triggerRefresh]);

  if (mode === "list" && !canView) {
    return <PermissionDenied />;
  }

  if (mode === "create" && !canCreate) {
    return <PermissionDenied />;
  }

  if (mode === "view" && !canView) {
    return <PermissionDenied />;
  }

  if (mode === "create" && docNoLoading) return <Loading />;
  if (mode === "view" && memoLoading) return <Loading />;

  if (mode === "create") {
    return (
      <>
        <div className="mb-4">
          <Button
            variant="light"
            onPress={() => navigateTo("list")}
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            กลับไปรายการ
          </Button>
        </div>
        <MemoForm
          formHandler={createFormHandler}
          mode="create"
          operatedBy={userName}
          onSubmitForApproval={handleSubmitForApprovalCreate}
        />
      </>
    );
  }

  if (mode === "view" && memo) {
    const status = memo.memoStatus || "DRAFT";
    const isReadOnly = status === "APPROVED";
    const canEditMemo = canEdit && (status === "DRAFT" || status === "REJECTED");

    return (
      <>
        <div className="mb-4">
          <Button
            variant="light"
            onPress={() => navigateTo("list")}
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            กลับไปรายการ
          </Button>
        </div>
        <MemoForm
          formHandler={updateFormHandler}
          mode="update"
          operatedBy={userName}
          isUpdate
          memo={memo}
          onSubmitForApproval={canEditMemo ? handleSubmitForApprovalUpdate : null}
          onApprove={
            (status === "PENDING_SALES_MANAGER" && canApproveSM) ||
            (status === "PENDING_CEO" && canApproveCEO)
              ? handleApproveView
              : null
          }
          onReject={
            (status === "PENDING_SALES_MANAGER" && canApproveSM) ||
            (status === "PENDING_CEO" && canApproveCEO)
              ? handleRejectClickView
              : null
          }
          canApproveSM={canApproveSM}
          canApproveCEO={canApproveCEO}
          isReadOnly={isReadOnly || !canEditMemo}
        />

        <MemoRejectModal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          rejectReason={rejectReason}
          onReasonChange={setRejectReason}
          onConfirm={handleRejectConfirmView}
        />
      </>
    );
  }

  return (
    <>
      <MemoList
        Memos={memos}
        loading={listLoading}
        onAddNew={canCreate ? handleAddNew : null}
        onEdit={canEdit ? handleEdit : null}
        onView={handleView}
        onApprove={canApproveSM || canApproveCEO ? handleApproveList : null}
        onReject={canApproveSM || canApproveCEO ? handleRejectClickList : null}
        canApproveSM={canApproveSM}
        canApproveCEO={canApproveCEO}
      />

      <MemoRejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        rejectReason={rejectReason}
        onReasonChange={setRejectReason}
        onConfirm={handleRejectConfirmList}
      />
    </>
  );
}

export default function MemoPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MemoPageContent />
    </Suspense>
  );
}
