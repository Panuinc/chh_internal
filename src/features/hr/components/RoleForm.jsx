"use client";
import React from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

export default function UIRoleForm({
  formHandler,
  mode,
  isUpdate,
  operatedBy,
}) {
  const { formRef, formData, handleChange, handleSubmit, errors } = formHandler;

  return (
    <div className="flex flex-col w-full h-full overflow-auto p-2">
      <div className="w-full h-full">
        <div className="bg-background rounded-lg border border-default h-full flex flex-col">
          {/* Card header */}
          <div className="p-2 border-b border-default">
            <h2 className="text-[13px] font-semibold text-foreground">
              {mode === "create" ? "Create Role" : "Update Role"}
            </h2>
            <p className="text-[12px] text-default-400">
              {mode === "create" ? "Add a new role to the system" : "Update role information"}
            </p>
          </div>

          {/* Card body */}
          <form ref={formRef} onSubmit={handleSubmit} className="p-2 space-y-5 flex-1 flex flex-col">
            <div className="flex flex-col xl:flex-row gap-2">
              <div className="flex-1">
                <Input
                  name="roleName"
                  type="text"
                  label="Role Name"
                  labelPlacement="outside"
                  placeholder="Enter Role Name"
                  variant="bordered"
                  size="md"
                  radius="sm"
                  isRequired
                  value={formData.roleName || ""}
                  onChange={handleChange("roleName")}
                  isInvalid={!!errors.roleName}
                  errorMessage={errors.roleName?.[0] || errors.roleName}
                  classNames={{ label: "text-default-600 text-xs font-medium", input: "text-sm", inputWrapper: "border-default hover:border-default shadow-none" }}
                />
              </div>

              {isUpdate && (
                <div className="flex-1">
                  <Select
                    name="roleStatus"
                    label="Role Status"
                    labelPlacement="outside"
                    placeholder="Please Select"
                    variant="bordered"
                    size="md"
                    radius="sm"
                    isRequired
                    selectedKeys={
                      formData.roleStatus ? [formData.roleStatus] : []
                    }
                    onSelectionChange={(keys) =>
                      handleChange("roleStatus")([...keys][0])
                    }
                    isInvalid={!!errors.roleStatus}
                    errorMessage={
                      errors.roleStatus?.[0] || errors.roleStatus
                    }
                    classNames={{ label: "text-default-600 text-xs font-medium", trigger: "border-default hover:border-default shadow-none" }}
                  >
                    <SelectItem key="Active">Active</SelectItem>
                    <SelectItem key="Inactive">Inactive</SelectItem>
                  </Select>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-default ">
              <span className="text-xs text-default-400">
                {mode === "create" ? `Create by: ${operatedBy}` : `Update by: ${operatedBy}`}
              </span>
              <Button
                type="submit"
                size="sm"
                radius="sm"
                className="bg-foreground text-background font-medium hover:bg-default-800"
              >
                {mode === "create" ? "Create" : "Save changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
