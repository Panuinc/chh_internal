"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { VisitorForm } from "@/features/security";
import { Loading } from "@/components";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useVisitor, useSubmitVisitor } from "@/features/security";
import { useEmployees } from "@/features/hr";
import { useFormHandler, useMenu } from "@/hooks";

export default function VisitorUpdate() {
  const router = useRouter();
  const { hasPermission } = useMenu();

  const { visitorId } = useParams();
  const { userId: sessionUserId, userName } = useSessionUser();

  const { visitor, loading: visitorLoading } =
    useVisitor(visitorId);

  const { employees } = useEmployees(undefined, true); // fetchAll = true

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

  const { setFormData } = formHandler;

  useEffect(() => {
    if (visitor) {
      setFormData({
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
  }, [visitor, setFormData]);

  if (visitorLoading) return <Loading />;

  return (
    <VisitorForm
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
