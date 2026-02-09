"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRoles } from "@/features/hr";
import { usePermissions } from "@/features/hr";
import { useRolePermission } from "@/features/hr";
import { useMenu, useSessionUser } from "@/hooks";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";

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

    setError(null);

    try {
      await updateRolePermissions(
        selectedRoleId,
        selectedPermissions,
        user.id
      );
      // Refresh permissions after save
      const data = await getRolePermissions(selectedRoleId);
      setRolePermissions(data.permissions || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const getRoleName = () => {
    const role = roles.find((r) => r.roleId === selectedRoleId);
    return role ? role.roleName : "-";
  };

  const isLoading = rolesLoading || permissionsLoading || loadingRolePerms;

  return (
    <div className="flex flex-col items-center justify-start w-full h-full overflow-auto">
      <form
        onSubmit={(e) => { e.preventDefault(); handleSave(); }}
        className="flex flex-col items-center justify-start w-full xl:w-8/12 h-full gap-4 border-l-2 border-r-2 border-default overflow-auto p-4"
      >
        {/* Role Selection */}
        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit gap-4">
          <div className="flex items-center justify-center w-full h-full gap-2">
            <Select
              label="Select Role"
              labelPlacement="outside"
              placeholder="Choose a role..."
              selectedKeys={selectedRoleId ? [selectedRoleId] : []}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              isLoading={rolesLoading}
              variant="bordered"
              size="md"
              radius="md"
              isRequired
            >
              {roles.map((role) => (
                <SelectItem key={role.roleId} value={role.roleId}>
                  {role.roleName}
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

        {/* Current Permissions Display */}
        {selectedRoleId && rolePermissions.length > 0 && (
          <div className="flex flex-col w-full gap-2">
            <label className="text-sm font-medium">Current Permissions:</label>
            <div className="flex flex-wrap gap-2">
              {rolePermissions.map((rp) => (
                <Chip
                  key={rp.rolePermissionId}
                  color={rp.permission?.permissionStatus === "Active" ? "primary" : "default"}
                  variant="flat"
                  size="sm"
                >
                  {rp.permission?.permissionName || "Unknown"}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {/* Permissions Selection */}
        {selectedRoleId && (
          <div className="flex flex-col w-full gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Assign Permissions:</label>
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
                    isSelected={selectedPermissions.includes(permission.permissionId)}
                    onValueChange={() => handlePermissionToggle(permission.permissionId)}
                    isDisabled={!canEdit}
                    size="sm"
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
          <div className="flex items-center justify-center w-full h-32 text-gray-500">
            Please select a role to manage its permissions
          </div>
        )}

        {/* Submit Button */}
        {selectedRoleId && canEdit && (
          <div className="flex flex-row items-center justify-end w-full h-fit gap-2 mt-auto">
            <div className="flex items-center justify-end w-full h-full gap-2">
              <Button
                type="button"
                variant="flat"
                size="md"
                radius="md"
                onPress={() => {
                  setSelectedRoleId("");
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
                Save Permissions
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
