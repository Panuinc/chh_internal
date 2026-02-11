"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/Toast";

const API_URL = "/api/hr/account";

const TOAST = {
  SUCCESS: "success",
  DANGER: "danger",
  WARNING: "warning",
};

function formatAccount(account, index = null) {
  if (!account) return null;

  const getFullName = (employee) =>
    employee
      ? `${employee.employeeFirstName} ${employee.employeeLastName}`
      : "-";

  return {
    ...account,
    ...(index !== null && { accountIndex: index + 1 }),
    accountEmployeeName: getFullName(account.accountEmployee),
    accountCreatedByName: getFullName(account.createdByEmployee),
    accountUpdatedByName: getFullName(account.updatedByEmployee),
  };
}

function getErrorMessage(error) {
  if (typeof error === "string") return error;
  return error?.message || "Unknown error";
}

async function fetchWithAbort(url, options, signal) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    signal,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed with status ${response.status}`,
    );
  }

  return data;
}

export function useAccounts(apiUrl = API_URL, fetchAll = false) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const url = fetchAll ? `${apiUrl}?limit=9999` : apiUrl;
        const result = await fetchWithAbort(url, {}, controller.signal);

        const items = result.accounts || result.data || [];

        const formatted = Array.isArray(items)
          ? items.map((p, i) => formatAccount(p, i)).filter(Boolean)
          : [];

        setAccounts(formatted);
      } catch (err) {
        if (err.name === "AbortError") return;
        showToast(TOAST.DANGER, `Error: ${getErrorMessage(err)}`);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [apiUrl, fetchAll]);

  return { accounts, loading };
}

export function useAccount(accountId) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accountId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const result = await fetchWithAbort(
          `${API_URL}/${accountId}`,
          {},
          controller.signal,
        );

        const item = result.account || result.data;

        if (!item) {
          showToast(TOAST.WARNING, "No Account data found.");
          return;
        }

        setAccount(formatAccount(item));
      } catch (err) {
        if (err.name === "AbortError") return;
        showToast(TOAST.DANGER, `Error: ${getErrorMessage(err)}`);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [accountId]);

  return { account, loading };
}

export function useSubmitAccount({
  mode = "create",
  accountId = null,
  currentEmployeeId,
}) {
  const router = useRouter();

  return useCallback(
    async (formRefOrData, formDataOrSetErrors, setErrorsOptional) => {
      let formData, setErrors;

      if (setErrorsOptional !== undefined) {
        formData = formDataOrSetErrors;
        setErrors = setErrorsOptional;
      } else {
        formData = formRefOrData;
        setErrors = formDataOrSetErrors || (() => {});
      }

      const isCreate = mode === "create";
      const byField = isCreate ? "accountCreatedBy" : "accountUpdatedBy";

      const payload = {
        accountUsername: formData.accountUsername,
        accountPassword: formData.accountPassword || null,
        accountPinNumber: formData.accountPinNumber || null,
        ...(isCreate
          ? { accountEmployeeId: formData.accountEmployeeId }
          : { accountStatus: formData.accountStatus }),
        [byField]: currentEmployeeId,
      };

      const url = isCreate ? API_URL : `${API_URL}/${accountId}`;
      const method = isCreate ? "POST" : "PUT";

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok) {
          showToast(TOAST.SUCCESS, result.message || "Success");
          setTimeout(() => router.push("/hr/account"), 1500);
        } else {
          if (result.details && typeof result.details === "object") {
            setErrors(result.details);
          } else {
            setErrors({});
          }

          showToast(TOAST.DANGER, result.error || "Failed to submit Account.");
        }
      } catch (err) {
        showToast(
          TOAST.DANGER,
          `Failed to submit Account: ${getErrorMessage(err)}`,
        );
      }
    },
    [mode, accountId, currentEmployeeId, router],
  );
}
