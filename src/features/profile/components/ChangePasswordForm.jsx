"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Eye, EyeOff } from "lucide-react";

export default function UIChangePasswordForm({
  formHandler,
  operatedBy,
  success,
  isLoading,
}) {
  const { formRef, formData, handleChange, handleSubmit, errors } = formHandler;

  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-2"
    >
      <Input
        name="currentPassword"
        type={showCurrentPassword ? "text" : "password"}
        label="Current Password"
        labelPlacement="outside"
        placeholder="Enter current password"
        variant="bordered"
        size="sm"
        radius="sm"
        isRequired
        value={formData.currentPassword || ""}
        onChange={handleChange("currentPassword")}
        isInvalid={!!errors.currentPassword}
        errorMessage={errors.currentPassword?.[0] || errors.currentPassword}
        classNames={{
          label: "text-default-600 text-xs font-medium",
          input: "text-[13px]",
          inputWrapper: "border-default hover:border-default shadow-none h-9",
        }}
        endContent={
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="focus:outline-none"
          >
            {showCurrentPassword ? (
              <EyeOff className="w-4 h-4 text-default-400" />
            ) : (
              <Eye className="w-4 h-4 text-default-400" />
            )}
          </button>
        }
      />

      <Input
        name="newPassword"
        type={showNewPassword ? "text" : "password"}
        label="New Password"
        labelPlacement="outside"
        placeholder="Enter new password"
        variant="bordered"
        size="sm"
        radius="sm"
        isRequired
        value={formData.newPassword || ""}
        onChange={handleChange("newPassword")}
        isInvalid={!!errors.newPassword}
        errorMessage={errors.newPassword?.[0] || errors.newPassword}
        classNames={{
          label: "text-default-600 text-xs font-medium",
          input: "text-[13px]",
          inputWrapper: "border-default hover:border-default shadow-none h-9",
        }}
        endContent={
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="focus:outline-none"
          >
            {showNewPassword ? (
              <EyeOff className="w-4 h-4 text-default-400" />
            ) : (
              <Eye className="w-4 h-4 text-default-400" />
            )}
          </button>
        }
      />

      <Input
        name="confirmPassword"
        type={showConfirmPassword ? "text" : "password"}
        label="Confirm New Password"
        labelPlacement="outside"
        placeholder="Confirm new password"
        variant="bordered"
        size="sm"
        radius="sm"
        isRequired
        value={formData.confirmPassword || ""}
        onChange={handleChange("confirmPassword")}
        isInvalid={!!errors.confirmPassword}
        errorMessage={errors.confirmPassword?.[0] || errors.confirmPassword}
        classNames={{
          label: "text-default-600 text-xs font-medium",
          input: "text-[13px]",
          inputWrapper: "border-default hover:border-default shadow-none h-9",
        }}
        endContent={
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="focus:outline-none"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4 text-default-400" />
            ) : (
              <Eye className="w-4 h-4 text-default-400" />
            )}
          </button>
        }
      />

      {success && (
        <div className="p-2 bg-green-50 border border-green-200 text-green-700 rounded-md text-[13px] text-center">
          Password changed successfully!
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <span className="text-[12px] text-default-400">Update by: {operatedBy}</span>
        <Button
          type="submit"
          size="sm"
          radius="sm"
          className="bg-foreground text-background font-medium hover:bg-default-800"
          isLoading={isLoading}
          isDisabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
