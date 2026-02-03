"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import UIPatrolForm from "@/module/security/patrol/UIPatrolForm";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useSubmitPatrol } from "@/app/(pages)/security/_hooks/usePatrol";
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
    <UIPatrolForm
      formHandler={formHandler}
      mode="create"
      operatedBy={userName}
    />
  );
}