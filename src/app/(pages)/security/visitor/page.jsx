"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VisitorList, VisitorForm, useVisitor } from "@/features/security";
import { useEmployees } from "@/features/hr";
import { Loading, PermissionDenied } from "@/components";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useFormHandler, useMenu } from "@/hooks";
import { showToast } from "@/components/ui/Toast";

const API_URL = "/api/security/visitor";
const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
};

function VisitorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = useMenu();
  const { userId: sessionUserId, userName } = useSessionUser();

  const mode = searchParams.get("mode") || "list";
  const editId = searchParams.get("id");

  const [refreshKey, setRefreshKey] = useState(0);

  const [visitors, setVisitors] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    const fetchVisitors = async () => {
      setListLoading(true);
      try {
        const response = await fetch(API_URL, { credentials: "include" });
        const result = await response.json().catch(() => ({}));
        const items = result.visitors || result.data || [];
        setVisitors(items);
      } catch (err) {
        showToast(TOAST.DANGER, `Error fetching visitors: ${err.message}`);
      } finally {
        setListLoading(false);
      }
    };

    fetchVisitors();
  }, [refreshKey]);

  const { visitor, loading: visitorLoading } = useVisitor(
    mode === "edit" && editId ? editId : null
  );

  const { employees } = useEmployees(undefined, true);

  if (mode === "list" && !hasPermission("security.visitor.view")) {
    return <PermissionDenied />;
  }

  if (mode === "create" && !hasPermission("security.visitor.create")) {
    return <PermissionDenied />;
  }

  if (mode === "edit" && !hasPermission("security.visitor.edit")) {
    return <PermissionDenied />;
  }

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const navigateTo = useCallback((newMode, id = null) => {
    const params = new URLSearchParams();
    if (newMode !== "list") params.set("mode", newMode);
    if (id) params.set("id", id);
    
    const queryString = params.toString();
    const url = queryString ? `/security/visitor?${queryString}` : "/security/visitor";
    
    router.push(url);
  }, [router]);

  const handleCreateSubmit = useCallback(async (formRef, formData, setErrors) => {
    const submitFormData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "visitorPhoto" && value instanceof File) {
        submitFormData.append("visitorPhoto", value);
      } else if (key === "visitorDocumentPhotos" && Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) {
            submitFormData.append("visitorDocumentPhotos", file);
          }
        });
      } else if (value !== null && value !== undefined) {
        submitFormData.append(key, String(value));
      }
    });

    submitFormData.append("visitorCreatedBy", sessionUserId);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        credentials: "include",
        body: submitFormData,
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        showToast(TOAST.SUCCESS, result.message || "Visitor created successfully");
        triggerRefresh();
        navigateTo("list");
        return { success: true };
      } else {
        if (result.details && typeof result.details === "object") {
          setErrors(result.details);
        }
        showToast(TOAST.DANGER, result.error || "Failed to create visitor");
        return { success: false };
      }
    } catch (err) {
      showToast(TOAST.DANGER, `Failed to create visitor: ${err.message}`);
      return { success: false };
    }
  }, [sessionUserId, triggerRefresh, navigateTo]);

  const handleUpdateSubmit = useCallback(async (formRef, formData, setErrors) => {
    if (!editId) return { success: false };

    const submitFormData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "visitorPhoto" && value instanceof File) {
        submitFormData.append("visitorPhoto", value);
      } else if (key === "visitorDocumentPhotos" && Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) {
            submitFormData.append("visitorDocumentPhotos", file);
          }
        });
      } else if (value !== null && value !== undefined) {
        submitFormData.append(key, String(value));
      }
    });

    submitFormData.append("visitorUpdatedBy", sessionUserId);

    try {
      const response = await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        credentials: "include",
        body: submitFormData,
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        showToast(TOAST.SUCCESS, result.message || "Visitor updated successfully");
        triggerRefresh();
        navigateTo("list");
        return { success: true };
      } else {
        if (result.details && typeof result.details === "object") {
          setErrors(result.details);
        }
        showToast(TOAST.DANGER, result.error || "Failed to update visitor");
        return { success: false };
      }
    } catch (err) {
      showToast(TOAST.DANGER, `Failed to update visitor: ${err.message}`);
      return { success: false };
    }
  }, [sessionUserId, editId, triggerRefresh, navigateTo]);

  const createFormHandler = useFormHandler(
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
    handleCreateSubmit
  );

  const updateFormHandler = useFormHandler(
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
    handleUpdateSubmit
  );

  useEffect(() => {
    if (mode === "edit" && visitor) {
      updateFormHandler.setFormData({
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
  }, [mode, visitor]);

  useEffect(() => {
    if (mode === "list") {
      createFormHandler.setFormData({
        visitorFirstName: "",
        visitorLastName: "",
        visitorCompany: "",
        visitorCarRegistration: "",
        visitorProvince: "",
        visitorContactUserId: "",
        visitorContactReason: "",
        visitorPhoto: null,
        visitorDocumentPhotos: [],
      });
      updateFormHandler.setFormData({
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
      });
    }
  }, [mode]);

  const handleAddNew = useCallback(() => {
    if (!hasPermission("security.visitor.create")) return;
    navigateTo("create");
  }, [hasPermission, navigateTo]);

  const handleEdit = useCallback((item) => {
    if (!hasPermission("security.visitor.edit")) return;
    navigateTo("edit", item.visitorId);
  }, [hasPermission, navigateTo]);

  const handleBackToList = useCallback(() => {
    navigateTo("list");
  }, [navigateTo]);

  if (mode === "list") {
    return (
      <VisitorList
        Visitors={visitors}
        loading={listLoading}
        onAddNew={hasPermission("security.visitor.create") ? handleAddNew : null}
        onEdit={hasPermission("security.visitor.edit") ? handleEdit : null}
      />
    );
  }

  if (mode === "create") {
    return (
      <div className="flex flex-col w-full h-full">
        <div className="flex items-center gap-2 p-2 border-b-1 border-default">
          <button
            onClick={handleBackToList}
            className="text-sm text-primary hover:underline"
          >
            ← Back to List
          </button>
        </div>
        <VisitorForm
          formHandler={createFormHandler}
          mode="create"
          operatedBy={userName}
          employees={employees}
        />
      </div>
    );
  }

  if (mode === "edit") {
    if (visitorLoading) {
      return (
        <div className="flex flex-col w-full h-full">
          <div className="flex items-center gap-2 p-2 border-b-1 border-default">
            <button
              onClick={handleBackToList}
              className="text-sm text-primary hover:underline"
            >
              ← Back to List
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Loading />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col w-full h-full">
        <div className="flex items-center gap-2 p-2 border-b-1 border-default">
          <button
            onClick={handleBackToList}
            className="text-sm text-primary hover:underline"
          >
            ← Back to List
          </button>
        </div>
        <VisitorForm
          formHandler={updateFormHandler}
          mode="update"
          operatedBy={userName}
          isUpdate
          employees={employees}
          existingPhoto={visitor?.visitorPhoto}
          existingDocumentPhotos={visitor?.visitorDocumentPhotos}
        />
      </div>
    );
  }

  return null;
}

export default function VisitorPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VisitorPageContent />
    </Suspense>
  );
}
