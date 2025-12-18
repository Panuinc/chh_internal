"use client";
import React from "react";
import { Button, Input, Select, SelectItem } from "@heroui/react";

export default function UIEmployeeForm({
  formHandler,
  mode,
  isUpdate,
  operatedBy,
}) {
  const { formRef, formData, handleChange, handleSubmit, errors } = formHandler;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-start w-full xl:w-12/12 h-full gap-2 border-1 rounded-xl overflow-auto"
    >
      <div className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center h-full p-4 gap-2 border-b-1">
          {mode === "create"
            ? `Create By : ${operatedBy}`
            : `Update By : ${operatedBy}`}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <Input
            name="employeeFirstName"
            type="text"
            label="First Name"
            labelPlacement="outside"
            placeholder="Enter First Name"
            color="default"
            variant="bordered"
            size="lg"
            radius="sm"
            isRequired
            value={formData.employeeFirstName || ""}
            onChange={handleChange("employeeFirstName")}
            isInvalid={!!errors.employeeFirstName}
            errorMessage={
              errors.employeeFirstName?.[0] || errors.employeeFirstName
            }
          />
        </div>
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <Input
            name="employeeLastName"
            type="text"
            label="Last Name"
            labelPlacement="outside"
            placeholder="Enter Last Name"
            color="default"
            variant="bordered"
            size="lg"
            radius="sm"
            isRequired
            value={formData.employeeLastName || ""}
            onChange={handleChange("employeeLastName")}
            isInvalid={!!errors.employeeLastName}
            errorMessage={
              errors.employeeLastName?.[0] || errors.employeeLastName
            }
          />
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <Input
            name="employeeEmail"
            type="email"
            label="Email"
            labelPlacement="outside"
            placeholder="Enter Email Address"
            color="default"
            variant="bordered"
            size="lg"
            radius="sm"
            isRequired
            value={formData.employeeEmail || ""}
            onChange={handleChange("employeeEmail")}
            isInvalid={!!errors.employeeEmail}
            errorMessage={errors.employeeEmail?.[0] || errors.employeeEmail}
          />
        </div>
      </div>

      {isUpdate && (
        <div className="flex flex-col xl:flex-row items-center justify-end w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full xl:w-6/12 h-full p-2 gap-2">
            <Select
              name="employeeStatus"
              label="Status"
              labelPlacement="outside"
              placeholder="Please Select"
              color="default"
              variant="bordered"
              size="lg"
              radius="sm"
              isRequired
              selectedKeys={
                formData.employeeStatus ? [formData.employeeStatus] : []
              }
              onSelectionChange={(keys) =>
                handleChange("employeeStatus")([...keys][0])
              }
              isInvalid={!!errors.employeeStatus}
              errorMessage={errors.employeeStatus?.[0] || errors.employeeStatus}
            >
              <SelectItem key="Active">Active</SelectItem>
              <SelectItem key="Inactive">Inactive</SelectItem>
            </Select>
          </div>
        </div>
      )}

      <div className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-end w-full h-full p-2 gap-2">
          <Button
            type="submit"
            color="success"
            variant="shadow"
            size="lg"
            radius="sm"
            className="w-2/12 text-background"
          >
            Submit
          </Button>
        </div>
      </div>
    </form>
  );
}
