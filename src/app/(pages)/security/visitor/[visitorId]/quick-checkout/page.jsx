"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { showToast } from "@/components";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useVisitor, useCheckoutVisitor } from "@/features/security";
import { QuickCheckout } from "@/features/security";

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
      showToast("warning", "Please log in first");
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
    <QuickCheckout
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
