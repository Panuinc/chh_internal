"use client";
import React from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

export default function UIAccountForm({
  formHandler,
  mode,
  isUpdate,
  operatedBy,
  employees = [],
  account = null,
}) {
  const { formRef, formData, handleChange, handleSubmit, errors } = formHandler;

  return (
    <div className="flex flex-col w-full h-full overflow-auto p-2">
      <div className="w-full h-full">
        <div className="bg-background rounded-lg border border-default h-full flex flex-col">
          {/* Card header */}
          <div className="p-2 border-b border-default">
            <h2 className="text-[13px] font-semibold text-foreground">
              {mode === "create" ? "Create Account" : "Update Account"}
            </h2>
            <p className="text-[12px] text-default-400">
              {mode === "create" ? "Create a new system account" : "Update account information"}
            </p>
          </div>

          {/* Card body */}
          <form ref={formRef} onSubmit={handleSubmit} className="p-2 space-y-5 flex-1 flex flex-col">
            {!isUpdate && (
              <div className="flex flex-col xl:flex-row gap-2">
                <div className="flex-1">
                  <Select
                    name="accountEmployeeId"
                    label="Employee"
                    labelPlacement="outside"
                    placeholder="Select Employee"
                    variant="bordered"
                    size="md"
                    radius="sm"
                    isRequired
                    selectedKeys={
                      formData.accountEmployeeId ? [formData.accountEmployeeId] : []
                    }
                    onSelectionChange={(keys) =>
                      handleChange("accountEmployeeId")([...keys][0])
                    }
                    isInvalid={!!errors.accountEmployeeId}
                    errorMessage={
                      errors.accountEmployeeId?.[0] || errors.accountEmployeeId
                    }
                    classNames={{ label: "text-default-600 text-xs font-medium", trigger: "border-default hover:border-default shadow-none" }}
                  >
                    {employees.map((emp) => (
                      <SelectItem key={emp.employeeId}>
                        {`${emp.employeeFirstName} ${emp.employeeLastName}`}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {isUpdate && account && (
              <div className="flex flex-col xl:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    label="Employee"
                    labelPlacement="outside"
                    value={`${account.accountEmployee?.employeeFirstName || ""} ${
                      account.accountEmployee?.employeeLastName || ""
                    }`}
                    isReadOnly
                    variant="bordered"
                    size="md"
                    radius="sm"
                    classNames={{ label: "text-default-600 text-xs font-medium", input: "text-sm", inputWrapper: "border-default hover:border-default shadow-none" }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col xl:flex-row gap-2">
              <div className="flex-1">
                <Input
                  name="accountUsername"
                  type="text"
                  label="Username"
                  labelPlacement="outside"
                  placeholder="Enter Username"
                  variant="bordered"
                  size="md"
                  radius="sm"
                  isRequired
                  value={formData.accountUsername || ""}
                  onChange={handleChange("accountUsername")}
                  isInvalid={!!errors.accountUsername}
                  errorMessage={errors.accountUsername?.[0] || errors.accountUsername}
                  classNames={{ label: "text-default-600 text-xs font-medium", input: "text-sm", inputWrapper: "border-default hover:border-default shadow-none" }}
                />
              </div>
              <div className="flex-1">
                <Input
                  name="accountPassword"
                  type="password"
                  label={isUpdate ? "New Password" : "Password"}
                  labelPlacement="outside"
                  placeholder={
                    isUpdate ? "Leave blank to keep current" : "Enter Password"
                  }
                  variant="bordered"
                  size="md"
                  radius="sm"
                  isRequired={!isUpdate}
                  value={formData.accountPassword || ""}
                  onChange={handleChange("accountPassword")}
                  isInvalid={!!errors.accountPassword}
                  errorMessage={errors.accountPassword?.[0] || errors.accountPassword}
                  classNames={{ label: "text-default-600 text-xs font-medium", input: "text-sm", inputWrapper: "border-default hover:border-default shadow-none" }}
                />
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-2">
              <div className="flex-1">
                <Input
                  name="accountPinNumber"
                  type="password"
                  label={isUpdate ? "New PIN Number" : "PIN Number"}
                  labelPlacement="outside"
                  placeholder={
                    isUpdate
                      ? "Leave blank to keep current"
                      : "Enter PIN Number (Optional)"
                  }
                  variant="bordered"
                  size="md"
                  radius="sm"
                  value={formData.accountPinNumber || ""}
                  onChange={handleChange("accountPinNumber")}
                  isInvalid={!!errors.accountPinNumber}
                  errorMessage={
                    errors.accountPinNumber?.[0] || errors.accountPinNumber
                  }
                  classNames={{ label: "text-default-600 text-xs font-medium", input: "text-sm", inputWrapper: "border-default hover:border-default shadow-none" }}
                />
              </div>

              {isUpdate && (
                <div className="flex-1">
                  <Select
                    name="accountStatus"
                    label="Status"
                    labelPlacement="outside"
                    placeholder="Please Select"
                    variant="bordered"
                    size="md"
                    radius="sm"
                    isRequired
                    selectedKeys={
                      formData.accountStatus ? [formData.accountStatus] : []
                    }
                    onSelectionChange={(keys) =>
                      handleChange("accountStatus")([...keys][0])
                    }
                    isInvalid={!!errors.accountStatus}
                    errorMessage={errors.accountStatus?.[0] || errors.accountStatus}
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
