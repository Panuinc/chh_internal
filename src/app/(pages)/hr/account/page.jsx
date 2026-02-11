"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AccountList, AccountForm, useAccounts, useAccount, useEmployees } from "@/features/hr";
import { Loading, PermissionDenied } from "@/components";
import { useSessionUser } from "@/features/auth/hooks/useSessionUser";
import { useFormHandler, useMenu } from "@/hooks";
import { showToast } from "@/components/ui/Toast";
import { Button } from "@heroui/button";
import { ArrowLeft } from "lucide-react";

const API_URL = "/api/hr/account";

const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
  WARNING: "warning",
};

function getErrorMessage(error) {
  if (typeof error === "string") return error;
  return error?.message || "Unknown error";
}

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasPermission } = useMenu();
  const { userId: sessionUserId, userName } = useSessionUser();

  const mode = searchParams.get("mode") || "list";
  const editId = searchParams.get("id");

  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isListMode = mode === "list";

  const { accounts, loading: accountsLoading, refresh: refreshAccounts } = useAccounts(undefined, true);
  const { account, loading: accountLoading } = useAccount(editId);
  const { employees } = useEmployees(undefined, true);

  // Permission checks for list view
  if (isListMode && !hasPermission("hr.account.view")) {
    return <PermissionDenied />;
  }

  // Permission checks for create/edit modes
  if (isCreateMode && !hasPermission("hr.account.create")) {
    return <PermissionDenied />;
  }

  if (isEditMode && !hasPermission("hr.account.edit")) {
    return <PermissionDenied />;
  }

  // Navigation functions
  const navigateTo = (newMode, id = null) => {
    const params = new URLSearchParams();
    if (newMode !== "list") {
      params.set("mode", newMode);
    }
    if (id) {
      params.set("id", id);
    }
    const query = params.toString();
    router.push(query ? `/hr/account?${query}` : "/hr/account");
  };

  // Submit handlers
  const handleCreateSubmit = async (formRef, formData, setErrors) => {
    const payload = {
      accountEmployeeId: formData.accountEmployeeId,
      accountUsername: formData.accountUsername,
      accountPassword: formData.accountPassword || null,
      accountPinNumber: formData.accountPinNumber || null,
      accountCreatedBy: sessionUserId,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        showToast(TOAST.SUCCESS, result.message || "Account created successfully");
        await refreshAccounts();
        navigateTo("list");
      } else {
        if (result.details && typeof result.details === "object") {
          setErrors(result.details);
        } else {
          setErrors({});
        }
        showToast(TOAST.DANGER, result.error || "Failed to create account.");
      }
    } catch (err) {
      showToast(TOAST.DANGER, `Failed to create account: ${getErrorMessage(err)}`);
    }
  };

  const handleUpdateSubmit = async (formRef, formData, setErrors) => {
    const payload = {
      accountId: editId,
      accountUsername: formData.accountUsername,
      accountPassword: formData.accountPassword || null,
      accountPinNumber: formData.accountPinNumber || null,
      accountStatus: formData.accountStatus,
      accountUpdatedBy: sessionUserId,
    };

    try {
      const response = await fetch(`${API_URL}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        showToast(TOAST.SUCCESS, result.message || "Account updated successfully");
        await refreshAccounts();
        navigateTo("list");
      } else {
        if (result.details && typeof result.details === "object") {
          setErrors(result.details);
        } else {
          setErrors({});
        }
        showToast(TOAST.DANGER, result.error || "Failed to update account.");
      }
    } catch (err) {
      showToast(TOAST.DANGER, `Failed to update account: ${getErrorMessage(err)}`);
    }
  };

  // Form handlers
  const createFormHandler = useFormHandler(
    {
      accountEmployeeId: "",
      accountUsername: "",
      accountPassword: "",
      accountPinNumber: "",
    },
    handleCreateSubmit
  );

  const updateFormHandler = useFormHandler(
    {
      accountUsername: "",
      accountPassword: "",
      accountPinNumber: "",
      accountStatus: "",
    },
    handleUpdateSubmit
  );

  // Populate update form when account data loads
  useEffect(() => {
    if (account && isEditMode) {
      updateFormHandler.setFormData({
        accountUsername: account.accountUsername || "",
        accountPassword: "",
        accountPinNumber: "",
        accountStatus: account.accountStatus || "",
      });
    }
  }, [account, isEditMode]);

  // Event handlers
  const handleAddNew = () => {
    if (!hasPermission("hr.account.create")) return;
    navigateTo("create");
  };

  const handleEdit = (item) => {
    if (!hasPermission("hr.account.edit")) return;
    navigateTo("edit", item.accountId);
  };

  const handleBackToList = () => {
    navigateTo("list");
  };

  // Render list mode
  if (isListMode) {
    return (
      <AccountList
        Accounts={accounts}
        loading={accountsLoading}
        onAddNew={hasPermission("hr.account.create") ? handleAddNew : null}
        onEdit={hasPermission("hr.account.edit") ? handleEdit : null}
      />
    );
  }

  // Render create mode
  if (isCreateMode) {
    const availableEmployees = employees.filter((emp) => emp.employeeStatus === "Active");

    return (
      <div className="flex flex-col w-full h-full">
        <div className="mb-4">
          <Button
            variant="light"
            size="sm"
            onPress={handleBackToList}
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="text-default-600"
          >
            Back to List
          </Button>
        </div>
        <AccountForm
          formHandler={createFormHandler}
          mode="create"
          operatedBy={userName}
          employees={availableEmployees}
        />
      </div>
    );
  }

  // Render edit mode
  if (isEditMode) {
    if (accountLoading) return <Loading />;

    return (
      <div className="flex flex-col w-full h-full">
        <div className="mb-4">
          <Button
            variant="light"
            size="sm"
            onPress={handleBackToList}
            startContent={<ArrowLeft className="w-4 h-4" />}
            className="text-default-600"
          >
            Back to List
          </Button>
        </div>
        <AccountForm
          formHandler={updateFormHandler}
          mode="update"
          operatedBy={userName}
          account={account}
          isUpdate
        />
      </div>
    );
  }

  return null;
}

export default function AccountPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AccountPageContent />
    </Suspense>
  );
}
