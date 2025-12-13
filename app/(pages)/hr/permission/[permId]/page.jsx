"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import {
  usePermission,
  usePermissionForm,
  UIPermissionForm,
} from "@/module/hr/permission";

export default function EditPermissionPage() {
  const router = useRouter();
  const params = useParams();
  const permId = params.permId;

  const { data: session, status } = useSession();

  const { fetchPermissionById, updatePermission } = usePermission();
  const form = usePermissionForm();

  const [permission, setPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isSuperAdmin = permission?.permName === "superAdmin";

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.isSuperAdmin) {
      router.replace("/forbidden");
    }
  }, [session, status, router]);

  useEffect(() => {
    const loadPermission = async () => {
      if (!permId) return;

      setIsLoading(true);
      const result = await fetchPermissionById(permId);

      if (result.success) {
        setPermission(result.data);
        form.setField("permName", result.data.permName);
        form.setField("permStatus", result.data.permStatus);
      } else {
        setPermission(null);
      }

      setIsLoading(false);
    };

    loadPermission();
  }, [permId]);

  const handleSubmit = async () => {
    if (!form.validate()) return;

    form.setIsSubmitting(true);
    const result = await updatePermission(permId, {
      permName: form.formData.permName,
      permStatus: form.formData.permStatus,
    });
    form.setIsSubmitting(false);

    if (result.success) {
      router.push("/hr/permission");
    }
  };

  if (status === "loading" || !session?.user?.isSuperAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        Loading...
      </div>
    );
  }

  if (!permission) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        Permission not found
      </div>
    );
  }

  return (
    <UIPermissionForm
      mode="edit"
      form={{
        data: form.formData,
        errors: form.errors,
        setField: form.setField,
      }}
      isSubmitting={form.isSubmitting}
      onSubmit={handleSubmit}
      isSuperAdmin={isSuperAdmin}
    />
  );
}
