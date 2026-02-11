"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PatrolList, PatrolForm } from "@/features/security";
import { Loading, PermissionDenied } from "@/components";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useFormHandler, useMenu } from "@/hooks";
import { showToast } from "@/components/ui/Toast";

const API_URL = "/api/security/patrol";
const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
};

function PatrolPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = useMenu();
  const { userId: sessionUserId, userName } = useSessionUser();

  const mode = searchParams.get("mode") || "list";

  const [refreshKey, setRefreshKey] = useState(0);

  const [patrols, setPatrols] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    const fetchPatrols = async () => {
      setListLoading(true);
      try {
        const response = await fetch(API_URL, { credentials: "include" });
        const result = await response.json().catch(() => ({}));
        const items = result.patrols || result.data || [];
        setPatrols(items);
      } catch (err) {
        showToast(TOAST.DANGER, `Error fetching patrols: ${err.message}`);
      } finally {
        setListLoading(false);
      }
    };

    fetchPatrols();
  }, [refreshKey]);

  if (mode === "list" && !hasPermission("security.patrol.view")) {
    return <PermissionDenied />;
  }

  if (mode === "create" && !hasPermission("security.patrol.create")) {
    return <PermissionDenied />;
  }

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const navigateTo = useCallback((newMode) => {
    const params = new URLSearchParams();
    if (newMode !== "list") params.set("mode", newMode);
    
    const queryString = params.toString();
    const url = queryString ? `/security/patrol?${queryString}` : "/security/patrol";
    
    router.push(url);
  }, [router]);

  const handleCreateSubmit = useCallback(async (formRef, formData, setErrors) => {
    const submitFormData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "patrolPicture" && value instanceof File) {
        submitFormData.append("patrolPicture", value);
      } else if (value !== null && value !== undefined) {
        submitFormData.append(key, String(value));
      }
    });

    submitFormData.append("patrolCreatedBy", sessionUserId);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        body: submitFormData,
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        showToast(TOAST.SUCCESS, result.message || "Patrol created successfully");
        triggerRefresh();
        navigateTo("list");
        return { success: true };
      } else {
        if (result.details && typeof result.details === "object") {
          setErrors(result.details);
        }
        showToast(TOAST.DANGER, result.error || "Failed to create patrol");
        return { success: false };
      }
    } catch (err) {
      showToast(TOAST.DANGER, `Failed to create patrol: ${err.message}`);
      return { success: false };
    }
  }, [sessionUserId, triggerRefresh, navigateTo]);

  const createFormHandler = useFormHandler(
    {
      patrolQrCodeInfo: "",
      patrolNote: "",
      patrolPicture: null,
    },
    handleCreateSubmit
  );

  useEffect(() => {
    if (mode === "list") {
      createFormHandler.setFormData({
        patrolQrCodeInfo: "",
        patrolNote: "",
        patrolPicture: null,
      });
    }
  }, [mode]);

  const handleAddNew = useCallback(() => {
    if (!hasPermission("security.patrol.create")) return;
    navigateTo("create");
  }, [hasPermission, navigateTo]);

  const handleBackToList = useCallback(() => {
    navigateTo("list");
  }, [navigateTo]);

  if (mode === "list") {
    return (
      <PatrolList
        Patrols={patrols}
        loading={listLoading}
        onAddNew={hasPermission("security.patrol.create") ? handleAddNew : null}
      />
    );
  }

  if (mode === "create") {
    return (
      <div className="flex flex-col w-full h-full">
        <div className="flex items-center gap-2 p-2 border-b border-default">
          <button
            onClick={handleBackToList}
            className="text-sm text-primary hover:underline"
          >
            ← Back to List
          </button>
        </div>
        <PatrolForm
          formHandler={createFormHandler}
          mode="create"
          operatedBy={userName}
        />
      </div>
    );
  }

  return null;
}

export default function PatrolPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PatrolPageContent />
    </Suspense>
  );
}
