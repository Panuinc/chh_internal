"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";

export function EmployeeRoleForm({
  employees,
  roles,
  employeeRoles,
  selectedEmployeeId,
  selectedRoles,
  onEmployeeChange,
  onRoleToggle,
  onSubmit,
  onCancel,
  loading,
  saving,
  canEdit,
  error,
  user,
}) {
  const getEmployeeName = () => {
    const emp = employees.find((e) => e.employeeId === selectedEmployeeId);
    return emp ? `${emp.employeeFirstName} ${emp.employeeLastName}` : "-";
  };

  const isLoading = loading;
  const rolesLoading = !roles || roles.length === 0 && loading;

  return (
    <div className="flex flex-col items-center justify-start w-full h-full overflow-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex flex-col items-center justify-start w-full h-full gap-2 border-l-2 border-r-2 border-default overflow-auto p-2"
      >
        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit gap-2">
          <div className="flex items-center justify-center w-full h-full gap-2">
            <Select
              label="Select Employee"
              labelPlacement="outside"
              placeholder="Choose an employee..."
              selectedKeys={selectedEmployeeId ? [selectedEmployeeId] : []}
              onChange={(e) => onEmployeeChange(e.target.value)}
              isLoading={isLoading && !employees.length}
              variant="bordered"
              size="md"
              radius="md"
              isRequired
            >
              {employees.map((emp) => (
                <SelectItem key={emp.employeeId} value={emp.employeeId}>
                  {`${emp.employeeFirstName} ${emp.employeeLastName} (${emp.employeeEmail})`}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-center w-full p-2 text-danger text-sm">
            {error}
          </div>
        )}

        {selectedEmployeeId && employeeRoles.length > 0 && (
          <div className="flex flex-col w-full gap-2">
            <label className="text-sm font-medium">Current Roles:</label>
            <div className="flex flex-wrap gap-2">
              {employeeRoles.map((er) => (
                <Chip
                  key={er.employeeRoleId}
                  color={er.role?.roleStatus === "Active" ? "primary" : "default"}
                  variant="flat"
                  size="sm"
                >
                  {er.role?.roleName || "Unknown"}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {selectedEmployeeId && (
          <div className="flex flex-col w-full gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Assign Roles:</label>
              {isLoading && <Spinner size="sm" />}
            </div>

            {rolesLoading ? (
              <div className="flex justify-center p-2">
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {roles.map((role) => (
                  <Checkbox
                    key={role.roleId}
                    isSelected={selectedRoles.includes(role.roleId)}
                    onValueChange={() => onRoleToggle(role.roleId)}
                    isDisabled={!canEdit}
                    size="sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{role.roleName}</span>
                      <span className={`text-xs ${role.roleStatus === "Active" ? "text-green-600" : "text-red-600"}`}>
                        {role.roleStatus}
                      </span>
                    </div>
                  </Checkbox>
                ))}
              </div>
            )}

            {roles.length === 0 && !rolesLoading && (
              <p className="text-gray-500 text-center p-2">No roles available</p>
            )}
          </div>
        )}

        {!selectedEmployeeId && (
          <div className="flex items-center justify-center w-full h-32 text-gray-500">
            Please select an employee to manage their roles
          </div>
        )}

        {selectedEmployeeId && canEdit && (
          <div className="flex flex-row items-center justify-end w-full h-fit gap-2 ">
            <div className="flex items-center justify-end w-full h-full gap-2">
              <Button
                type="button"
                variant="flat"
                size="md"
                radius="md"
                onPress={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="shadow"
                size="md"
                radius="md"
                className="text-background"
                isLoading={saving}
                isDisabled={saving}
              >
                Save Roles
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
          <div className="flex items-end justify-center h-full p-2 gap-2 text-sm text-gray-500">
            {`Update By : ${user?.name || "-"}`}
          </div>
        </div>
      </form>
    </div>
  );
}

export default EmployeeRoleForm;
