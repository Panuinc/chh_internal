"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePermission, usePermissionForm } from "@/module/hr/permission";
import { UIPermissionForm } from "@/module/hr/permission";

export default function CreatePermissionPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.isSuperAdmin) {
      router.replace("/forbidden");
    }
  }, [session, status, router]);

  const { createPermission, fetchPermissions } = usePermission();
  const form = usePermissionForm();

  const handleSubmit = async () => {
    if (!form.validate()) return;

    form.setIsSubmitting(true);
    const result = await createPermission(form.formData.permName);
    form.setIsSubmitting(false);

    if (result.success) {
      fetchPermissions();
      router.push("/hr/permission");
    }
  };

  if (status === "loading" || !session?.user?.isSuperAdmin) {
    return null;
  }

  return (
    <UIPermissionForm
      mode="create"
      form={{
        data: form.formData,
        errors: form.errors,
        setField: form.setField,
      }}
      isSubmitting={form.isSubmitting}
      onSubmit={handleSubmit}
    />
  );
}
