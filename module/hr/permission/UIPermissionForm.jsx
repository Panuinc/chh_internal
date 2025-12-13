"use client";
import { Button, Input } from "@heroui/react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function UIPermissionForm({
  mode = "create",
  form,
  isSubmitting,
  onSubmit,
  isSuperAdmin = false,
}) {
  const isEdit = mode === "edit";

  return (
    <div className="flex flex-col items-center justify-start w-full xl:w-10/12 h-full p-2 gap-2 border overflow-auto">
      <div className="flex items-center justify-between w-full p-4 gap-2 border rounded-lg">
        <div className="flex items-center gap-4">
          <Link href="/hr/permission">
            <Button isIconOnly variant="light">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h2 className="text-xl font-semibold">
            {isEdit ? "Edit Permission" : "Create New Permission"}
          </h2>
        </div>
      </div>

      <div className="flex flex-col w-full p-6 gap-4 border rounded-lg">
        <Input
          label="Permission Name"
          placeholder="e.g. hr.employee.create"
          value={form.data.permName}
          onChange={(e) => form.setField("permName", e.target.value)}
          isInvalid={!!form.errors.permName}
          errorMessage={form.errors.permName}
          isDisabled={isSuperAdmin}
          description="Use format: module.action or module.submodule.action"
          size="lg"
        />
      </div>

      <div className="flex flex-col w-full p-6 gap-2 border rounded-lg">
        <p className="font-medium mb-2">Permission Examples:</p>
        <ul className="space-y-2 text-sm text-foreground/70">
          <li>
            <code className="bg-foreground/10 px-2 py-1 rounded">hr.view</code>
            <span className="ml-2">– View HR module</span>
          </li>
          <li>
            <code className="bg-foreground/10 px-2 py-1 rounded">
              hr.employee.view
            </code>
            <span className="ml-2">– View employees</span>
          </li>
          <li>
            <code className="bg-foreground/10 px-2 py-1 rounded">
              hr.employee.create
            </code>
            <span className="ml-2">– Create employee</span>
          </li>
          <li>
            <code className="bg-foreground/10 px-2 py-1 rounded">hr.*</code>
            <span className="ml-2">– Full HR access</span>
          </li>
          <li>
            <code className="bg-foreground/10 px-2 py-1 rounded">
              superAdmin
            </code>
            <span className="ml-2">– System-wide admin permission</span>
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-end w-full p-4 gap-2 border rounded-lg">
        <Link href="/hr/permission">
          <Button color="danger" variant="light">
            Cancel
          </Button>
        </Link>
        <Button
          color="primary"
          onPress={onSubmit}
          isLoading={isSubmitting}
          isDisabled={!form.data.permName.trim() || isSuperAdmin}
          startContent={!isSubmitting && <Save size={18} />}
        >
          {isEdit ? "Save Changes" : "Create Permission"}
        </Button>
      </div>
    </div>
  );
}
