"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UIVisitorForm from "@/module/security/visitor/UIVisitorForm";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useSubmitVisitor } from "@/app/api/security/visitor/core";
import { useFormHandler, useMenu } from "@/hooks";

export default function VisitorCreate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { userId, userName } = useSessionUser();

  useEffect(() => {
    if (!hasPermission("security.visitor.create")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const submitVisitor = useSubmitVisitor({
    mode: "create",
    currentVisitorId: userId,
  });

  const formHandler = useFormHandler(
    {
      visitorName: "",
    },
    submitVisitor
  );

  return (
    <UIVisitorForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
    />
  );
}
