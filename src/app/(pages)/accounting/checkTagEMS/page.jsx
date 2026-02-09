"use client";

import { CheckTagEMS, useCheckTagEMS } from "@/features/accounting";
import { useMenu } from "@/hooks";

export default function CheckTagEMSPage() {
  const { hasPermission } = useMenu();
  const { trackingData, loading, error, searchEMS } = useCheckTagEMS();

  if (!hasPermission("accounting.checkTagEMS.view")) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-danger">
          You do not have permission to access this page
        </p>
      </div>
    );
  }

  return (
    <CheckTagEMS
      trackingData={trackingData}
      loading={loading}
      error={error}
      onSearch={searchEMS}
    />
  );
}
