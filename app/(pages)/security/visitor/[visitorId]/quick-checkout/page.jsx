"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import showToast from "@/components/UIToast";
import { useSessionUser } from "@/hooks/useSessionUser";
import {
  useVisitor,
  useCheckoutVisitor,
} from "@/app/api/security/visitor/core";
import UIQuickCheckout from "@/module/security/visitor/UIQuickCheckout";

export default function QuickCheckoutPage() {
  const router = useRouter();
  const { visitorId } = useParams();
  const { userId, loading: sessionLoading } = useSessionUser();
  const { visitor, loading: visitorLoading } = useVisitor(visitorId);
  const { checkout, loading: checkoutLoading } = useCheckoutVisitor();

  const [success, setSuccess] = useState(false);
  const [updatedVisitor, setUpdatedVisitor] = useState(null);

  const handleCheckout = async () => {
    if (!visitor) return;

    if (!userId) {
      showToast("warning", "กรุณาเข้าสู่ระบบก่อน");
      router.push(
        `/login?callbackUrl=/security/visitor/${visitorId}/quick-checkout`
      );
      return;
    }

    const result = await checkout(visitorId, userId, (data) => {
      setSuccess(true);
      setUpdatedVisitor(data);
    });

    if (!result) {
    }
  };

  const handleGoBack = () => {
    router.push("/security/visitor");
  };

  return (
    <UIQuickCheckout
      visitor={updatedVisitor || visitor}
      loading={visitorLoading || sessionLoading}
      checkoutLoading={checkoutLoading}
      success={success}
      isLoggedIn={!!userId}
      onCheckout={handleCheckout}
      onGoBack={handleGoBack}
    />
  );
}
