"use client";

import { useEffect } from "react";
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

  const formHandler = useFormHandler(
    {
      documentNo: documentNo || "",
      to: "",
      copy: "",
      subject: "",
      date: new Date().toISOString().split("T")[0],
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

  useEffect(() => {
    if (documentNo) {
      formHandler.setFormData((prev) => ({
        ...prev,
        documentNo: documentNo,
      }));
    }
  }, [documentNo]);

  if (docNoLoading) return <Loading />;

  return (
    <UIMemoForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
    />
  );
}
