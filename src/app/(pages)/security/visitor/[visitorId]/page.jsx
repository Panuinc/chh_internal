"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import UIVisitorForm from "@/app/(pages)/security/_components/visitor/UIVisitorForm";
import { Loading } from "@/components";
import { useSessionUser } from "@/hooks/useSessionUser";
import {
  useVisitor,
  useSubmitVisitor,
} from "@/app/(pages)/security/_hooks/useVisitor";
import { useEmployees } from "@/app/(pages)/hr/_hooks/useEmployee";
import { useFormHandler, useMenu } from "@/hooks";

export default function VisitorUpdate() {
  const router = useRouter();
  const { hasPermission } = useMenu();

  const { visitorId } = useParams();
  const { userId: sessionUserId, userName } = useSessionUser();

  const { visitor, loading: visitorLoading } =
    useVisitor(visitorId);

  const { employees } = useEmployees();

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
      visitorFirstName: "",
      visitorLastName: "",
      visitorCompany: "",
      visitorCarRegistration: "",
      visitorProvince: "",
      visitorContactUserId: "",
      visitorContactReason: "",
      visitorStatus: "",
      visitorPhoto: null,
      visitorDocumentPhotos: [],
    },
    submitVisitor
  );

  useEffect(() => {
    if (visitor) {
      formHandler.setFormData({
        visitorFirstName: visitor.visitorFirstName || "",
        visitorLastName: visitor.visitorLastName || "",
        visitorCompany: visitor.visitorCompany || "",
        visitorCarRegistration: visitor.visitorCarRegistration || "",
        visitorProvince: visitor.visitorProvince || "",
        visitorContactUserId: visitor.visitorContactUserId || "",
        visitorContactReason: visitor.visitorContactReason || "",
        visitorStatus: visitor.visitorStatus || "",
        visitorPhoto: null,
        visitorDocumentPhotos: [],
      });
    }
  }, [visitor, formHandler]);

  if (visitorLoading) return <Loading />;

  return (
    <UIVisitorForm
      formHandler={formHandler}
      mode="update"
      operatedBy={userName}
      isUpdate
      employees={employees}
      existingPhoto={visitor?.visitorPhoto}
      existingDocumentPhotos={visitor?.visitorDocumentPhotos}
    />
  );
}
