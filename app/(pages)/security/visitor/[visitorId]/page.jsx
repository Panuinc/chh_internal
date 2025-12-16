"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UIVisitorForm from "@/module/security/visitor/UIVisitorForm";
import { LoadingState } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import {
  useVisitor,
  useSubmitVisitor,
} from "@/app/api/security/visitor/core";
import { useFormHandler, useMenu } from "@/hooks";

export default function VisitorUpdate() {
  const router = useRouter();
  const { hasPermission } = useMenu();

  const { visitorId } = useParams();
  const { userId: sessionUserId, userName } = useSessionUser();

  const { visitor, loading: visitorLoading } =
    useVisitor(visitorId);

  useEffect(() => {
    if (!hasPermission("security.visitor.edit")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const submitVisitor = useSubmitVisitor({
    mode: "update",
    visitorId,
    currentVisitorId: sessionUserId,
  });

  const formHandler = useFormHandler(
    {
      visitorName: "",
      visitorStatus: "",
    },
    submitVisitor
  );

  useEffect(() => {
    if (visitor) {
      formHandler.setFormData({
        visitorName: visitor.visitorName || "",
        visitorStatus: visitor.visitorStatus || "",
      });
    }
  }, [visitor]);

  if (visitorLoading) return <LoadingState />;

  return (
    <UIVisitorForm
      formHandler={formHandler}
      mode="update"
      operatedBy={userName}
      isUpdate
    />
  );
}
