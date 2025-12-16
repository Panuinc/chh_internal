"use client";
import React from "react";
import { Button, Input, Select, SelectItem } from "@heroui/react";

export default function UIPermissionForm({
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
      className="flex flex-col items-center justify-start w-full xl:w-10/12 h-full gap-2 overflow-auto"
    >
      <div className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center h-full p-4 gap-2 border-1 rounded-xl">
          {mode === "create"
            ? `Create By : ${operatedBy}`
            : `Update By : ${operatedBy}`}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <Input
            name="permissionName"
            type="text"
            label="Permission Name"
            color="none"
            variant="none"
            size="lg"
            labelPlacement="outside"
            placeholder="Enter Permission Name"
            className="w-full border-1"
            isRequired
            value={formData.permissionName || ""}
            onChange={handleChange("permissionName")}
            isInvalid={!!errors.permissionName}
            errorMessage={errors.permissionName?.[0] || errors.permissionName}
          />
        </div>
      </div>

      {isUpdate && (
        <div className="flex flex-col xl:flex-row items-center justify-end w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full xl:w-6/12 h-full p-2 gap-2">
            <Select
              name="permissionStatus"
              label="Permission Status"
              labelPlacement="outside"
              placeholder="Please Select"
              color="none"
              variant="none"
              size="lg"
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
            >
              <SelectItem key="Active">Active</SelectItem>
              <SelectItem key="Inactive">Inactive</SelectItem>
            </Select>
          </div>
        </div>
      )}

      <div className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center w-full xl:w-2/12 h-full p-2 gap-2">
          <Button
            type="submit"
            color="none"
            variant="none"
            size="lg"
            className="w-full border-1"
          >
            Submit
          </Button>
        </div>
      </div>
    </form>
  );
}
