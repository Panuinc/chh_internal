"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PatrolForm } from "@/features/security";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useSubmitPatrol } from "@/features/security";
import { useFormHandler, useMenu } from "@/hooks";

export default function PatrolCreate() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { userId, userName } = useSessionUser();

  useEffect(() => {
    if (!hasPermission("security.patrol.create")) {
      router.replace("/forbidden");
    }
  }, [hasPermission, router]);

  const submitPatrol = useSubmitPatrol({
    mode: "create",
    currentPatrolId: userId,
  });

  const formHandler = useFormHandler(
    {
      patrolQrCodeInfo: "",
      patrolNote: "",
      patrolPicture: null,
    },
    submitPatrol
  );

  return (
    <PatrolForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
    />
  );
}
