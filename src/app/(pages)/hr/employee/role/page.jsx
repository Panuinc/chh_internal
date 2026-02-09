"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEmployees } from "@/features/hr";
import { useRoles } from "@/features/hr";
import { useEmployeeRole } from "@/features/hr";
import { useMenu, useSessionUser } from "@/hooks";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";

export default function EmployeeRolePage() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { user } = useSessionUser();
  
  const { employees, loading: employeesLoading } = useEmployees();
  const { roles, loading: rolesLoading } = useRoles();
  const { 
    loading: saving, 
    getEmployeeRoles, 
    updateEmployeeRoles 
  } = useEmployeeRole();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [loadingEmployeeRoles, setLoadingEmployeeRoles] = useState(false);
  const [error, setError] = useState(null);

  const canEdit = hasPermission("hr.employee.role.edit");

  // Load roles when employee is selected
  useEffect(() => {
    if (!selectedEmployeeId) {
      setEmployeeRoles([]);
      setSelectedRoles([]);
      return;
    }

    const loadEmployeeRoles = async () => {
      setLoadingEmployeeRoles(true);
      setError(null);
      try {
        const data = await getEmployeeRoles(selectedEmployeeId);
        setEmployeeRoles(data.roles || []);
        setSelectedRoles(
          (data.roles || []).map((r) => r.employeeRoleRoleId)
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingEmployeeRoles(false);
      }
    };

    loadEmployeeRoles();
  }, [selectedEmployeeId, getEmployeeRoles]);

  const handleRoleToggle = (roleId) => {
    if (!canEdit) return;
    
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = async () => {
    if (!canEdit || !selectedEmployeeId || !user?.id) return;

    setError(null);

    try {
      await updateEmployeeRoles(
        selectedEmployeeId,
        selectedRoles,
        user.id
      );
      // Refresh roles after save
      const data = await getEmployeeRoles(selectedEmployeeId);
      setEmployeeRoles(data.roles || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const getEmployeeName = () => {
    const emp = employees.find((e) => e.employeeId === selectedEmployeeId);
    return emp
      ? `${emp.employeeFirstName} ${emp.employeeLastName}`
      : "-";
  };

  const isLoading = employeesLoading || loadingEmployeeRoles;

  return (
    <div className="flex flex-col items-center justify-start w-full h-full overflow-auto">
      <form
        onSubmit={(e) => { e.preventDefault(); handleSave(); }}
        className="flex flex-col items-center justify-start w-full xl:w-8/12 h-full gap-4 border-l-2 border-r-2 border-default overflow-auto p-4"
      >
        {/* Employee Selection */}
        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit gap-4">
          <div className="flex items-center justify-center w-full h-full gap-2">
            <Select
              label="Select Employee"
              labelPlacement="outside"
              placeholder="Choose an employee..."
              selectedKeys={selectedEmployeeId ? [selectedEmployeeId] : []}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              isLoading={employeesLoading}
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

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center w-full p-2 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Current Roles Display */}
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

        {/* Roles Selection */}
        {selectedEmployeeId && (
          <div className="flex flex-col w-full gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Assign Roles:</label>
              {isLoading && <Spinner size="sm" />}
            </div>

            {rolesLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {roles.map((role) => (
                  <Checkbox
                    key={role.roleId}
                    isSelected={selectedRoles.includes(role.roleId)}
                    onValueChange={() => handleRoleToggle(role.roleId)}
                    isDisabled={!canEdit}
                    size="sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {role.roleName}
                      </span>
                      <span
                        className={`text-xs ${
                          role.roleStatus === "Active"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {role.roleStatus}
                      </span>
                    </div>
                  </Checkbox>
                ))}
              </div>
            )}

            {roles.length === 0 && !rolesLoading && (
              <p className="text-gray-500 text-center py-8">
                No roles available
              </p>
            )}
          </div>
        )}

        {!selectedEmployeeId && (
          <div className="flex items-center justify-center w-full h-32 text-gray-500">
            Please select an employee to manage their roles
          </div>
        )}

        {/* Submit Button */}
        {selectedEmployeeId && canEdit && (
          <div className="flex flex-row items-center justify-end w-full h-fit gap-2 mt-auto">
            <div className="flex items-center justify-end w-full h-full gap-2">
              <Button
                type="button"
                variant="flat"
                size="md"
                radius="md"
                onPress={() => {
                  setSelectedEmployeeId("");
                  setError(null);
                }}
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

        {/* Footer */}
        <div className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
          <div className="flex items-end justify-center h-full p-2 gap-2 text-sm text-gray-500">
            {`Update By : ${user?.name || "-"}`}
          </div>
        </div>
      </form>
    </div>
  );
}
