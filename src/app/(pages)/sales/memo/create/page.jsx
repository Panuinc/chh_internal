"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import UIMemoForm from "@/app/(pages)/sales/_components/memo/UIMemoForm";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useSubmitMemo, useNextDocumentNo } from "@/app/(pages)/sales/_hooks/useMemo";
import { useFormHandler, useMenu } from "@/hooks";
import { Loading } from "@/components";

export default function MemoCreate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { userId, userName } = useSessionUser();
  const { documentNo, loading: docNoLoading } = useNextDocumentNo();

  useEffect(() => {
    if (!hasPermission("sales.memo.create")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const submitMemo = useSubmitMemo({
    mode: "create",
    currentEmployeeId: userId,
  });

  const today = new Date().toISOString().split("T")[0];

  const formHandler = useFormHandler(
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
    submitMemo
  );

  // Destructure setFormData to avoid ESLint warning about formHandler dependency
  const { setFormData } = formHandler;

  useEffect(() => {
    if (documentNo) {
      setFormData((prev) => ({
        ...prev,
        documentNo: documentNo,
        requesterName: userName,
      }));
    }
  }, [documentNo, userName, setFormData]);

  const handleSubmitForApproval = useCallback(async () => {
    // Submit with PENDING_SALES_MANAGER status directly
    const submitData = {
      ...formHandler.formData,
      status: "PENDING_SALES_MANAGER",
      createdBy: userId,
    };
    
    console.log("=== SUBMIT FOR APPROVAL ===");
    console.log("submitData:", submitData);
    console.log("===========================");
    
    // Call submit directly with custom data
    await submitMemo(null, submitData, formHandler.setErrors);
  }, [formHandler.formData, userId, submitMemo, formHandler.setErrors]);

  if (docNoLoading) return <Loading />;

  return (
    <UIMemoForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
      onSubmitForApproval={handleSubmitForApproval}
    />
  );
}
