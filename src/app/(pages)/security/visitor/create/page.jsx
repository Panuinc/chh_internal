"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UIVisitorForm from "@/app/(pages)/security/_components/visitor/UIVisitorForm";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useSubmitVisitor } from "@/app/(pages)/security/_hooks/useVisitor";
import { useEmployees } from "@/app/(pages)/hr/_hooks/useEmployee";
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
    <UIVisitorForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
      employees={employees}
    />
  );
}
