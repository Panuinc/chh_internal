"use client";
import React from "react";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";

export default function UIAssignForm({
  employee,
  groupedPermissions,
  selectedIds,
  onToggle,
  onToggleCategory,
  onSelectAll,
  onDeselectAll,
  onSubmit,
  saving,
  operatedBy,
}) {
  const totalPermissions = groupedPermissions.reduce(
    (sum, g) => sum + g.permissions.length,
    0,
  );
  const selectedCount = selectedIds.size;

  const handleToggleSubGroup = (subGroupPermissions, isAllSelected) => {
    onToggleCategory(subGroupPermissions, isAllSelected);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-auto p-2">
      <div className="w-full h-full">
        <div className="bg-background rounded-lg border border-default h-full flex flex-col">
          {/* Card header */}
          <div className="p-2 border-b border-default">
            <h2 className="text-[13px] font-semibold text-foreground">
              Assign Permissions
            </h2>
            <p className="text-[12px] text-default-400">
              {employee?.employeeFirstName} {employee?.employeeLastName} ({employee?.employeeEmail})
            </p>
          </div>

          {/* Card body */}
          <div className="p-2 space-y-5 flex-1 flex flex-col overflow-auto">
            <div className="flex flex-col xl:flex-row items-center justify-between w-full gap-2">
              <div className="flex items-center justify-start w-full xl:w-6/12">
                <span className="text-sm text-default-500">
                  Selected: {selectedCount} / {totalPermissions}
                </span>
              </div>
              <div className="flex items-center justify-end w-full xl:w-6/12 gap-2">
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-foreground text-background font-medium hover:bg-default-800"
                  onPress={onSelectAll}
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  radius="sm"
                  className="bg-default-200 text-default-700 font-medium hover:bg-default-300"
                  onPress={onDeselectAll}
                >
                  Deselect All
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-start w-full gap-2">
              {groupedPermissions.map((group) => {
                const allSelected = group.permissions.every((p) =>
                  selectedIds.has(p.permissionId),
                );
                const someSelected =
                  !allSelected &&
                  group.permissions.some((p) => selectedIds.has(p.permissionId));

                return (
                  <div
                    key={group.category}
                    className="flex flex-col items-start justify-start w-full gap-2"
                  >
                    <div className="flex items-center justify-between w-full pb-2 border-b border-default">
                      <Checkbox
                        size="md"
                        radius="sm"
                        color={allSelected || someSelected ? "primary" : "default"}
                        isSelected={allSelected}
                        isIndeterminate={someSelected}
                        onValueChange={() =>
                          onToggleCategory(group.permissions, allSelected)
                        }
                        classNames={{
                          label: "font-semibold text-lg",
                          icon: "text-white",
                        }}
                      >
                        {group.categoryLabel}
                      </Checkbox>
                      <span className="text-sm text-default-400">
                        {
                          group.permissions.filter((p) =>
                            selectedIds.has(p.permissionId),
                          ).length
                        }{" "}
                        / {group.permissions.length}
                      </span>
                    </div>

                    <div className="flex flex-col w-full gap-2 p-2">
                      {group.subGroups.map((subGroup) => {
                        const subAllSelected = subGroup.permissions.every((p) =>
                          selectedIds.has(p.permissionId),
                        );
                        const subSomeSelected =
                          !subAllSelected &&
                          subGroup.permissions.some((p) =>
                            selectedIds.has(p.permissionId),
                          );

                        return (
                          <div
                            key={subGroup.subCategory}
                            className="flex flex-col w-full gap-2 p-2 bg-default-50 rounded-lg border border-default"
                          >
                            <div className="flex items-center justify-between w-full pb-2 border-b border-default">
                              <Checkbox
                                size="md"
                                radius="sm"
                                color={
                                  subAllSelected || subSomeSelected
                                    ? "secondary"
                                    : "default"
                                }
                                isSelected={subAllSelected}
                                isIndeterminate={subSomeSelected}
                                onValueChange={() =>
                                  handleToggleSubGroup(
                                    subGroup.permissions,
                                    subAllSelected,
                                  )
                                }
                                classNames={{
                                  label: "font-medium text-sm",
                                  icon: "text-white",
                                }}
                              >
                                {subGroup.subCategoryLabel}
                              </Checkbox>
                              <span className="text-xs text-default-400">
                                {
                                  subGroup.permissions.filter((p) =>
                                    selectedIds.has(p.permissionId),
                                  ).length
                                }{" "}
                                / {subGroup.permissions.length}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-2 w-full pt-1">
                              {subGroup.permissions.map((permission) => (
                                <div
                                  key={permission.permissionId}
                                  className="flex items-center justify-start w-full h-fit p-2 gap-2"
                                >
                                  <Checkbox
                                    size="md"
                                    radius="sm"
                                    color="primary"
                                    isSelected={selectedIds.has(
                                      permission.permissionId,
                                    )}
                                    onValueChange={() =>
                                      onToggle(permission.permissionId)
                                    }
                                    classNames={{
                                      icon: "text-white",
                                    }}
                                  >
                                    <span className="text-sm">
                                      {permission.permissionName}
                                    </span>
                                  </Checkbox>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-default ">
              <span className="text-xs text-default-400">
                Update by: {operatedBy}
              </span>
              <Button
                size="sm"
                radius="sm"
                className="bg-foreground text-background font-medium hover:bg-default-800"
                onPress={onSubmit}
                isLoading={saving}
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
