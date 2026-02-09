"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { VisitorForm } from "@/features/security";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useSubmitVisitor } from "@/features/security";
import { useEmployees } from "@/features/hr";
import { useFormHandler, useMenu } from "@/hooks";

export default function VisitorCreate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { userId, userName } = useSessionUser();

  const { employees } = useEmployees(undefined, true); // fetchAll = true

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
      visitorFirstName: "",
      visitorLastName: "",
      visitorCompany: "",
      visitorCarRegistration: "",
      visitorProvince: "",
      visitorContactUserId: "",
      visitorContactReason: "",
      visitorPhoto: null,
      visitorDocumentPhotos: [],
    },
    submitVisitor
  );

  return (
    <VisitorForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
      employees={employees}
    />
  );
}
