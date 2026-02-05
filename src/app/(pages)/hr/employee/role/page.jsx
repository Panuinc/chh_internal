"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEmployees } from "@/app/(pages)/hr/_hooks/useEmployee";
import { useRoles } from "@/app/(pages)/hr/_hooks/useRole";
import { useEmployeeRole } from "@/app/(pages)/hr/_hooks/useEmployeeRole";
import { useMenu, useSessionUser } from "@/hooks";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Select,
  SelectItem,
  Checkbox,
  Spinner,
  Alert,
  Chip,
} from "@heroui/react";

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
  const [message, setMessage] = useState(null);
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

    setMessage(null);
    setError(null);

    try {
      const result = await updateEmployeeRoles(
        selectedEmployeeId,
        selectedRoles,
        user.id
      );
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    }
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees.find((e) => e.employeeId === employeeId);
    return emp
      ? `${emp.employeeFirstName} ${emp.employeeLastName}`
      : employeeId;
  };

  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.roleId === roleId);
    return role ? role.roleName : roleId;
  };

  const isLoading = employeesLoading || rolesLoading || loadingEmployeeRoles;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Employee Roles Management</h1>
          <p className="text-gray-500 text-sm">
            Assign roles to employees (RBAC)
          </p>
        </CardHeader>

        <CardBody className="space-y-6">
          {message && (
            <Alert color="success" onClose={() => setMessage(null)}>
              {message}
            </Alert>
          )}
          
          {error && (
            <Alert color="danger" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Employee
            </label>
            <Select
              placeholder="Choose an employee..."
              selectedKeys={selectedEmployeeId ? [selectedEmployeeId] : []}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              isLoading={employeesLoading}
              className="max-w-md"
            >
              {employees.map((emp) => (
                <SelectItem key={emp.employeeId} value={emp.employeeId}>
                  {`${emp.employeeFirstName} ${emp.employeeLastName} (${emp.employeeEmail})`}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Current Roles Display */}
          {selectedEmployeeId && employeeRoles.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Current Roles:</h3>
              <div className="flex flex-wrap gap-2">
                {employeeRoles.map((er) => (
                  <Chip
                    key={er.employeeRoleId}
                    color={er.role?.roleStatus === "Active" ? "primary" : "default"}
                    variant="flat"
                  >
                    {er.role?.roleName || "Unknown"}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Roles List */}
          {selectedEmployeeId && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Assign Roles</h2>
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
            <div className="text-center py-8 text-gray-500">
              Please select an employee to manage their roles
            </div>
          )}
        </CardBody>

        {selectedEmployeeId && canEdit && (
          <CardFooter className="flex justify-end gap-3">
            <Button
              variant="flat"
              onPress={() => {
                setSelectedEmployeeId("");
                setMessage(null);
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSave}
              isLoading={saving}
              isDisabled={saving}
            >
              Save Roles
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
