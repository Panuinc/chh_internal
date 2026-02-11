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
    <div className="flex flex-col w-full h-full overflow-auto p-2">
      <div className="w-full h-full">
        <div className="bg-background rounded-lg border border-default h-full flex flex-col">
          {/* Card header */}
          <div className="p-2 border-b border-default">
            <h2 className="text-[13px] font-semibold text-foreground">
              {mode === "create" ? "Create Employee" : "Update Employee"}
            </h2>
            <p className="text-[12px] text-default-400">
              {mode === "create" ? "Add a new employee to the system" : "Update employee information"}
            </p>
          </div>

          {/* Card body */}
          <form ref={formRef} onSubmit={handleSubmit} className="p-2 space-y-5 flex-1 flex flex-col">
            <div className="flex flex-col xl:flex-row gap-2">
              <div className="flex-1">
                <Input
                  name="employeeFirstName"
                  type="text"
                  label="First Name"
                  labelPlacement="outside"
                  placeholder="Enter First Name"
                  variant="bordered"
                  size="md"
                  radius="sm"
                  isRequired
                  value={formData.employeeFirstName || ""}
                  onChange={handleChange("employeeFirstName")}
                  isInvalid={!!errors.employeeFirstName}
                  errorMessage={errors.employeeFirstName?.[0] || errors.employeeFirstName}
                  classNames={{ label: "text-default-600 text-xs font-medium", input: "text-sm", inputWrapper: "border-default hover:border-default shadow-none" }}
                />
              </div>
              <div className="flex-1">
                <Input
                  name="employeeLastName"
                  type="text"
                  label="Last Name"
                  labelPlacement="outside"
                  placeholder="Enter Last Name"
                  variant="bordered"
                  size="md"
                  radius="sm"
                  isRequired
                  value={formData.employeeLastName || ""}
                  onChange={handleChange("employeeLastName")}
                  isInvalid={!!errors.employeeLastName}
                  errorMessage={errors.employeeLastName?.[0] || errors.employeeLastName}
                  classNames={{ label: "text-default-600 text-xs font-medium", input: "text-sm", inputWrapper: "border-default hover:border-default shadow-none" }}
                />
              </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-2">
              <div className="flex-1">
                <Input
                  name="employeeEmail"
                  type="email"
                  label="Email"
                  labelPlacement="outside"
                  placeholder="Enter Email Address"
                  variant="bordered"
                  size="md"
                  radius="sm"
                  isRequired
                  value={formData.employeeEmail || ""}
                  onChange={handleChange("employeeEmail")}
                  isInvalid={!!errors.employeeEmail}
                  errorMessage={errors.employeeEmail?.[0] || errors.employeeEmail}
                  classNames={{ label: "text-default-600 text-xs font-medium", input: "text-sm", inputWrapper: "border-default hover:border-default shadow-none" }}
                />
              </div>
              {isUpdate && (
                <div className="flex-1">
                  <Select
                    name="employeeStatus"
                    label="Status"
                    labelPlacement="outside"
                    placeholder="Please Select"
                    variant="bordered"
                    size="md"
                    radius="sm"
                    isRequired
                    selectedKeys={formData.employeeStatus ? [formData.employeeStatus] : []}
                    onSelectionChange={(keys) => handleChange("employeeStatus")([...keys][0])}
                    isInvalid={!!errors.employeeStatus}
                    errorMessage={errors.employeeStatus?.[0] || errors.employeeStatus}
                    classNames={{ label: "text-default-600 text-xs font-medium", trigger: "border-default hover:border-default shadow-none" }}
                  >
                    <SelectItem key="Active">Active</SelectItem>
                    <SelectItem key="Inactive">Inactive</SelectItem>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex flex-col xl:flex-row gap-2">
              <div className="flex-1">
                <Select
                  name="employeeDepartmentId"
                  label="Department"
                  labelPlacement="outside"
                  placeholder="Select Department"
                  variant="bordered"
                  size="md"
                  radius="sm"
                  selectedKeys={formData.employeeDepartmentId ? [formData.employeeDepartmentId] : []}
                  onSelectionChange={(keys) => handleChange("employeeDepartmentId")([...keys][0])}
                  isInvalid={!!errors.employeeDepartmentId}
                  errorMessage={errors.employeeDepartmentId?.[0] || errors.employeeDepartmentId}
                  classNames={{ label: "text-default-600 text-xs font-medium", trigger: "border-default hover:border-default shadow-none" }}
                >
                  {departments.map((dept) => (
                    <SelectItem key={dept.departmentId}>{dept.departmentName}</SelectItem>
                  ))}
                </Select>
              </div>
              <div className="flex-1">
                <Select
                  name="employeeRoleId"
                  label="Role"
                  labelPlacement="outside"
                  placeholder="Select Role"
                  variant="bordered"
                  size="md"
                  radius="sm"
                  selectedKeys={formData.employeeRoleId ? [formData.employeeRoleId] : []}
                  onSelectionChange={(keys) => handleChange("employeeRoleId")([...keys][0])}
                  isInvalid={!!errors.employeeRoleId}
                  errorMessage={errors.employeeRoleId?.[0] || errors.employeeRoleId}
                  classNames={{ label: "text-default-600 text-xs font-medium", trigger: "border-default hover:border-default shadow-none" }}
                >
                  {roles.map((role) => (
                    <SelectItem key={role.roleId}>{role.roleName}</SelectItem>
                  ))}
                </Select>
              </div>
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
