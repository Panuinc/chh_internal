"use client";
import React from "react";
import { Button, Input, Select, SelectItem } from "@heroui/react";

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
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-start w-full xl:w-8/12 h-full gap-2 border-l-2 border-r-2 border-default overflow-auto"
    >
      {!isUpdate && (
        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Select
              name="accountEmployeeId"
              label="Employee"
              labelPlacement="outside"
              placeholder="Select Employee"
              color="default"
              variant="bordered"
              size="md"
              radius="md"
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
        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Input
              label="Employee"
              labelPlacement="outside"
              value={`${account.accountEmployee?.employeeFirstName || ""} ${
                account.accountEmployee?.employeeLastName || ""
              }`}
              isReadOnly
              variant="bordered"
              size="md"
              radius="md"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <Input
            name="accountUsername"
            type="text"
            label="Username"
            labelPlacement="outside"
            placeholder="Enter Username"
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            isRequired
            value={formData.accountUsername || ""}
            onChange={handleChange("accountUsername")}
            isInvalid={!!errors.accountUsername}
            errorMessage={errors.accountUsername?.[0] || errors.accountUsername}
          />
        </div>
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <Input
            name="accountPassword"
            type="password"
            label={isUpdate ? "New Password" : "Password"}
            labelPlacement="outside"
            placeholder={
              isUpdate ? "Leave blank to keep current" : "Enter Password"
            }
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            isRequired={!isUpdate}
            value={formData.accountPassword || ""}
            onChange={handleChange("accountPassword")}
            isInvalid={!!errors.accountPassword}
            errorMessage={errors.accountPassword?.[0] || errors.accountPassword}
          />
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
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
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            value={formData.accountPinNumber || ""}
            onChange={handleChange("accountPinNumber")}
            isInvalid={!!errors.accountPinNumber}
            errorMessage={
              errors.accountPinNumber?.[0] || errors.accountPinNumber
            }
          />
        </div>

        {isUpdate && (
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Select
              name="accountStatus"
              label="Status"
              labelPlacement="outside"
              placeholder="Please Select"
              color="default"
              variant="bordered"
              size="md"
              radius="md"
              isRequired
              selectedKeys={
                formData.accountStatus ? [formData.accountStatus] : []
              }
              onSelectionChange={(keys) =>
                handleChange("accountStatus")([...keys][0])
              }
              isInvalid={!!errors.accountStatus}
              errorMessage={errors.accountStatus?.[0] || errors.accountStatus}
            >
              <SelectItem key="Active">Active</SelectItem>
              <SelectItem key="Inactive">Inactive</SelectItem>
            </Select>
          </div>
        )}
      </div>

      <div className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-end w-full h-full p-2 gap-2">
          <Button
            type="submit"
            color="primary"
            variant="shadow"
            size="md"
            radius="md"
            className="w-2/12 text-background"
          >
            Submit
          </Button>
        </div>
      </div>

      <div className="flex flex-row items-center justify-end w-full h-full p-2 gap-2">
        <div className="flex items-end justify-center h-full p-2 gap-2">
          {mode === "create"
            ? `Create By : ${operatedBy}`
            : `Update By : ${operatedBy}`}
        </div>
      </div>
    </form>
  );
}
