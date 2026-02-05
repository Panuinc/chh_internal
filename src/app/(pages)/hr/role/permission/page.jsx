"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoles } from "@/app/(pages)/hr/_hooks/useRole";
import { usePermissions } from "@/app/(pages)/hr/_hooks/usePermission";
import { useRolePermission } from "@/app/(pages)/hr/_hooks/useRolePermission";
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
} from "@heroui/react";

export default function RolePermissionPage() {
  const router = useRouter();
  const { hasPermission } = useMenu();
  const { user } = useSessionUser();
  
  const { roles, loading: rolesLoading } = useRoles();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const { 
    loading: saving, 
    getRolePermissions, 
    updateRolePermissions 
  } = useRolePermission();

  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loadingRolePerms, setLoadingRolePerms] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const canEdit = hasPermission("hr.role.permission.edit");

  // Load permissions when role is selected
  useEffect(() => {
    if (!selectedRoleId) {
      setRolePermissions([]);
      setSelectedPermissions([]);
      return;
    }

    const loadRolePermissions = async () => {
      setLoadingRolePerms(true);
      setError(null);
      try {
        const data = await getRolePermissions(selectedRoleId);
        setRolePermissions(data.permissions || []);
        setSelectedPermissions(
          (data.permissions || []).map((p) => p.rolePermissionPermissionId)
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingRolePerms(false);
      }
    };

    loadRolePermissions();
  }, [selectedRoleId, getRolePermissions]);

  const handlePermissionToggle = (permissionId) => {
    if (!canEdit) return;
    
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSave = async () => {
    if (!canEdit || !selectedRoleId || !user?.id) return;

    setMessage(null);
    setError(null);

    try {
      const result = await updateRolePermissions(
        selectedRoleId,
        selectedPermissions,
        user.id
      );
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    }
  };

  const isLoading = rolesLoading || permissionsLoading || loadingRolePerms;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Role Permissions Management</h1>
          <p className="text-gray-500 text-sm">
            Assign permissions to roles (RBAC)
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

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Role
            </label>
            <Select
              placeholder="Choose a role..."
              selectedKeys={selectedRoleId ? [selectedRoleId] : []}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              isLoading={rolesLoading}
              className="max-w-md"
            >
              {roles.map((role) => (
                <SelectItem key={role.roleId} value={role.roleId}>
                  {role.roleName}
                </SelectItem>
              ))}
            </Select>
          </div>

          {/* Permissions List */}
          {selectedRoleId && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Permissions</h2>
                {isLoading && <Spinner size="sm" />}
              </div>

              {permissionsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {permissions.map((permission) => (
                    <Checkbox
                      key={permission.permissionId}
                      isSelected={selectedPermissions.includes(
                        permission.permissionId
                      )}
                      onValueChange={() =>
                        handlePermissionToggle(permission.permissionId)
                      }
                      isDisabled={!canEdit}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {permission.permissionName}
                        </span>
                        <span
                          className={`text-xs ${
                            permission.permissionStatus === "Active"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {permission.permissionStatus}
                        </span>
                      </div>
                    </Checkbox>
                  ))}
                </div>
              )}

              {permissions.length === 0 && !permissionsLoading && (
                <p className="text-gray-500 text-center py-8">
                  No permissions available
                </p>
              )}
            </div>
          )}

          {!selectedRoleId && (
            <div className="text-center py-8 text-gray-500">
              Please select a role to manage its permissions
            </div>
          )}
        </CardBody>

        {selectedRoleId && canEdit && (
          <CardFooter className="flex justify-end gap-3">
            <Button
              variant="flat"
              onPress={() => {
                setSelectedRoleId("");
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
              Save Permissions
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
