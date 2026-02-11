"use client";
import React from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

export default function UIPermissionForm({
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
              {mode === "create" ? "Create Permission" : "Update Permission"}
            </h2>
            <p className="text-[12px] text-default-400">
              {mode === "create" ? "Add a new permission to the system" : "Update permission information"}
            </p>
          </div>

          {/* Card body */}
          <form ref={formRef} onSubmit={handleSubmit} className="p-2 space-y-5 flex-1 flex flex-col">
            <div className="flex flex-col xl:flex-row gap-2">
              <div className="flex-1">
                <Input
                  name="permissionName"
                  type="text"
                  label="Permission Name"
                  labelPlacement="outside"
                  placeholder="Enter Permission Name"
                  variant="bordered"
                  size="md"
                  radius="sm"
                  isRequired
                  value={formData.permissionName || ""}
                  onChange={handleChange("permissionName")}
                  isInvalid={!!errors.permissionName}
                  errorMessage={errors.permissionName?.[0] || errors.permissionName}
                  classNames={{ label: "text-default-600 text-xs font-medium", input: "text-sm", inputWrapper: "border-default hover:border-default shadow-none" }}
                />
              </div>

              {isUpdate && (
                <div className="flex-1">
                  <Select
                    name="permissionStatus"
                    label="Permission Status"
                    labelPlacement="outside"
                    placeholder="Please Select"
                    variant="bordered"
                    size="md"
                    radius="sm"
                    isRequired
                    selectedKeys={
                      formData.permissionStatus ? [formData.permissionStatus] : []
                    }
                    onSelectionChange={(keys) =>
                      handleChange("permissionStatus")([...keys][0])
                    }
                    isInvalid={!!errors.permissionStatus}
                    errorMessage={
                      errors.permissionStatus?.[0] || errors.permissionStatus
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
