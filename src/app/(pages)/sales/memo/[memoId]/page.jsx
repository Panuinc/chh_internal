"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UIMemoForm from "@/app/(pages)/sales/_components/memo/UIMemoForm";
import { Loading } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import {
  useMemo,
  useSubmitMemo,
} from "@/app/(pages)/sales/_hooks/useMemo";
import { useFormHandler, useMenu } from "@/hooks";

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

  const { memo, loading: memoLoading } = useMemo(memoId);

  useEffect(() => {
    if (!hasPermission("sales.memo.edit")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

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
      salesManagerName: "",
      salesManagerDate: "",
      ceoName: "",
      ceoDate: "",
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
        salesManagerName: memo.memoSalesManagerName || "",
        salesManagerDate: formatDateForInput(memo.memoSalesManagerDate),
        ceoName: memo.memoCeoName || "",
        ceoDate: formatDateForInput(memo.memoCeoDate),
      });
    }
  }, [memo, setFormData]);

  if (memoLoading) return <Loading />;

  return (
    <UIMemoForm
      formHandler={formHandler}
      mode="update"
      operatedBy={userName}
      isUpdate
    />
  );
}
