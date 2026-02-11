"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";

/**
 * RolePermissionForm Component
 * 
 * Form สำหรับจัดการสิทธิ์ของ Role
 * 
 * @param {Object} props
 * @param {Array} props.roles - รายการ Roles
 * @param {Array} props.permissions - รายการ Permissions ทั้งหมด
 * @param {Array} props.rolePermissions - Permissions ที่ Role มีอยู่แล้ว
 * @param {string} props.selectedRoleId - Role ID ที่เลือก
 * @param {Array} props.selectedPermissions - Permission IDs ที่เลือก
 * @param {Function} props.onRoleChange - ฟังก์ชันเปลี่ยน Role
 * @param {Function} props.onPermissionToggle - ฟังก์สลับการเลือก Permission
 * @param {Function} props.onSubmit - ฟังก์ชันบันทึก
 * @param {Function} props.onCancel - ฟังก์ชันยกเลิก
 * @param {boolean} props.loading - สถานะกำลังโหลด
 * @param {boolean} props.saving - สถานะกำลังบันทึก
 * @param {boolean} props.canEdit - มีสิทธิ์แก้ไขหรือไม่
 * @param {string} props.error - ข้อความ error
 * @param {Object} props.user - ข้อมูลผู้ใช้งาน
 */
export function RolePermissionForm({
  roles,
  permissions,
  rolePermissions,
  selectedRoleId,
  selectedPermissions,
  onRoleChange,
  onPermissionToggle,
  onSubmit,
  onCancel,
  loading,
  saving,
  canEdit,
  error,
  user,
}) {
  const getRoleName = () => {
    const role = roles.find((r) => r.roleId === selectedRoleId);
    return role ? role.roleName : "-";
  };

  const isLoading = loading;
  const permissionsLoading = !permissions || permissions.length === 0 && loading;

  return (
    <div className="flex flex-col items-center justify-start w-full h-full overflow-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex flex-col items-center justify-start w-full xl:w-8/12 h-full gap-2 border-l-2 border-r-2 border-default overflow-auto p-2"
      >
        {/* Role Selection */}
        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit gap-2">
          <div className="flex items-center justify-center w-full h-full gap-2">
            <Select
              label="Select Role"
              labelPlacement="outside"
              placeholder="Choose a role..."
              selectedKeys={selectedRoleId ? [selectedRoleId] : []}
              onChange={(e) => onRoleChange(e.target.value)}
              isLoading={isLoading && !roles.length}
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
              <div className="flex justify-center p-2">
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {permissions.map((permission) => (
                  <Checkbox
                    key={permission.permissionId}
                    isSelected={selectedPermissions.includes(permission.permissionId)}
                    onValueChange={() => onPermissionToggle(permission.permissionId)}
                    isDisabled={!canEdit}
                    size="sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{permission.permissionName}</span>
                      <span className={`text-xs ${permission.permissionStatus === "Active" ? "text-green-600" : "text-red-600"}`}>
                        {permission.permissionStatus}
                      </span>
                    </div>
                  </Checkbox>
                ))}
              </div>
            )}

            {permissions.length === 0 && !permissionsLoading && (
              <p className="text-gray-500 text-center p-2">No permissions available</p>
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

export default RolePermissionForm;
