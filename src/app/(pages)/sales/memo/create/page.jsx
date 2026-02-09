"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MemoForm } from "@/features/sales";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useSubmitMemo, useNextDocumentNo } from "@/features/sales";
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
      to: "à¸„à¸¸à¸“à¸ˆà¸‡à¸„à¸¡ à¸Šà¸¹à¸Šà¸±à¸¢à¸¨à¸£à¸µ",
      copy: "à¸„à¸¸à¸“à¸™à¸§à¸žà¸¥ à¸Šà¸¹à¹€à¸à¸µà¸¢à¸£à¸•à¸´",
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
    <MemoForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
      onSubmitForApproval={handleSubmitForApproval}
    />
  );
}
