"use client";
import React from "react";
import { Button, Checkbox } from "@heroui/react";

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
    0
  );
  const selectedCount = selectedIds.size;

  return (
    <div className="flex flex-col items-center justify-start w-full xl:w-12/12 h-full gap-2 border-1 rounded-xl overflow-auto">
      <div className="flex flex-row items-center justify-between w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center h-full p-4 gap-2 border-b-1">
          Employee: {employee?.employeeFirstName} {employee?.employeeLastName} (
          {employee?.employeeEmail})
        </div>
        <div className="flex items-center justify-center h-full p-4 gap-2 border-b-1">
          Update By : {operatedBy}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-between w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-start w-full xl:w-6/12 h-full p-2 gap-2">
          <span className="text-sm text-default-500">
            Selected: {selectedCount} / {totalPermissions}
          </span>
        </div>
        <div className="flex items-center justify-end w-full xl:w-6/12 h-full p-2 gap-4">
          <Button
            color="default"
            variant="bordered"
            size="lg"
            radius="sm"
            onPress={onSelectAll}
          >
            Select All
          </Button>
          <Button
            color="default"
            variant="bordered"
            size="lg"
            radius="sm"
            onPress={onDeselectAll}
          >
            Deselect All
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-start w-full h-fit p-2 gap-4">
        {groupedPermissions.map((group) => {
          const allSelected = group.permissions.every((p) =>
            selectedIds.has(p.permissionId)
          );
          const someSelected =
            !allSelected &&
            group.permissions.some((p) => selectedIds.has(p.permissionId));

          return (
            <div
              key={group.category}
              className="flex flex-col items-start justify-start w-full h-fit p-4 gap-2 border-1 rounded-xl"
            >
              <div className="flex items-center justify-between w-full h-fit pb-2 border-b-1">
                <Checkbox
                  isSelected={allSelected}
                  isIndeterminate={someSelected}
                  onValueChange={() =>
                    onToggleCategory(group.permissions, allSelected)
                  }
                  classNames={{
                    label: "font-semibold text-lg",
                  }}
                >
                  {group.categoryLabel}
                </Checkbox>
                <span className="text-sm text-default-400">
                  {
                    group.permissions.filter((p) =>
                      selectedIds.has(p.permissionId)
                    ).length
                  }{" "}
                  / {group.permissions.length}
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-4 gap-2 w-full pt-2">
                {group.permissions.map((permission) => (
                  <div
                    key={permission.permissionId}
                    className="flex items-center justify-start w-full h-fit p-2 gap-2"
                  >
                    <Checkbox
                      isSelected={selectedIds.has(permission.permissionId)}
                      onValueChange={() => onToggle(permission.permissionId)}
                      size="sm"
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

      <div className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-end w-full h-full p-2 gap-2">
          <Button
            color="default"
            variant="bordered"
            size="lg"
            radius="sm"
            className="w-2/12"
            onPress={onSubmit}
            isLoading={saving}
          >
            {saving ? "Saving..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
