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
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-start w-full xl:w-8/12 h-full gap-2 border-l-2 border-r-2 border-default overflow-auto"
    >
      <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <Input
            name="roleName"
            type="text"
            label="Role Name"
            labelPlacement="outside"
            placeholder="Enter Role Name"
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            isRequired
            value={formData.roleName || ""}
            onChange={handleChange("roleName")}
            isInvalid={!!errors.roleName}
            errorMessage={errors.roleName?.[0] || errors.roleName}
          />
        </div>

        {isUpdate && (
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Select
              name="roleStatus"
              label="Role Status"
              labelPlacement="outside"
              placeholder="Please Select"
              color="default"
              variant="bordered"
              size="md"
              radius="md"
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
