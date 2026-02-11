"use client";
import React from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

export default function UIDepartmentForm({
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
          <div className="p-2 border-b border-default">
            <h2 className="text-[13px] font-semibold text-foreground">
              {mode === "create" ? "Create Department" : "Update Department"}
            </h2>
            <p className="text-[12px] text-default-400">
              {mode === "create" ? "Add a new department to the system" : "Update department information"}
            </p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="p-2 space-y-5 flex-1 flex flex-col">
            <div className="flex flex-col xl:flex-row gap-2">
              <div className="flex-1">
                <Input
                  name="departmentName"
                  type="text"
                  label="Department Name"
                  labelPlacement="outside"
                  placeholder="Enter Department Name"
                  variant="bordered"
                  size="md"
                  radius="sm"
                  isRequired
                  value={formData.departmentName || ""}
                  onChange={handleChange("departmentName")}
                  isInvalid={!!errors.departmentName}
                  errorMessage={errors.departmentName?.[0] || errors.departmentName}
                  classNames={{ label: "text-default-600 text-xs font-medium", input: "text-sm", inputWrapper: "border-default hover:border-default shadow-none" }}
                />
              </div>

              {isUpdate && (
                <div className="flex-1">
                  <Select
                    name="departmentStatus"
                    label="Department Status"
                    labelPlacement="outside"
                    placeholder="Please Select"
                    variant="bordered"
                    size="md"
                    radius="sm"
                    isRequired
                    selectedKeys={
                      formData.departmentStatus ? [formData.departmentStatus] : []
                    }
                    onSelectionChange={(keys) =>
                      handleChange("departmentStatus")([...keys][0])
                    }
                    isInvalid={!!errors.departmentStatus}
                    errorMessage={
                      errors.departmentStatus?.[0] || errors.departmentStatus
                    }
                    classNames={{ label: "text-default-600 text-xs font-medium", trigger: "border-default hover:border-default shadow-none" }}
                  >
                    <SelectItem key="Active">Active</SelectItem>
                    <SelectItem key="Inactive">Inactive</SelectItem>
                  </Select>
                </div>
              )}
            </div>

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
