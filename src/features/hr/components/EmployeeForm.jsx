"use client";
import React from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

export default function UIEmployeeForm({
  formHandler,
  mode,
  isUpdate,
  operatedBy,
  departments = [],
  roles = [],
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
            name="employeeFirstName"
            type="text"
            label="First Name"
            labelPlacement="outside"
            placeholder="Enter First Name"
            color="default"
            variant="bordered"
            size="md"
            radius="md"
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
            size="md"
            radius="md"
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
            size="md"
            radius="md"
            isRequired
            value={formData.employeeEmail || ""}
            onChange={handleChange("employeeEmail")}
            isInvalid={!!errors.employeeEmail}
            errorMessage={errors.employeeEmail?.[0] || errors.employeeEmail}
          />
        </div>

        {isUpdate && (
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <Select
              name="employeeStatus"
              label="Status"
              labelPlacement="outside"
              placeholder="Please Select"
              color="default"
              variant="bordered"
              size="md"
              radius="md"
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
        )}
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <Select
            name="employeeDepartmentId"
            label="Department"
            labelPlacement="outside"
            placeholder="Select Department"
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            selectedKeys={
              formData.employeeDepartmentId
                ? [formData.employeeDepartmentId]
                : []
            }
            onSelectionChange={(keys) =>
              handleChange("employeeDepartmentId")([...keys][0])
            }
            isInvalid={!!errors.employeeDepartmentId}
            errorMessage={
              errors.employeeDepartmentId?.[0] || errors.employeeDepartmentId
            }
          >
            {departments.map((dept) => (
              <SelectItem key={dept.departmentId}>
                {dept.departmentName}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <Select
            name="employeeRoleId"
            label="Role"
            labelPlacement="outside"
            placeholder="Select Role"
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            selectedKeys={
              formData.employeeRoleId ? [formData.employeeRoleId] : []
            }
            onSelectionChange={(keys) =>
              handleChange("employeeRoleId")([...keys][0])
            }
            isInvalid={!!errors.employeeRoleId}
            errorMessage={
              errors.employeeRoleId?.[0] || errors.employeeRoleId
            }
          >
            {roles.map((role) => (
              <SelectItem key={role.roleId}>{role.roleName}</SelectItem>
            ))}
          </Select>
        </div>
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
