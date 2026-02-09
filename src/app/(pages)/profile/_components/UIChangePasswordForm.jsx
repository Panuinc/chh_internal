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
      className="flex flex-col items-center justify-start w-full h-full gap-2 overflow-auto"
    >
      <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <Input
            name="currentPassword"
            type={showCurrentPassword ? "text" : "password"}
            label="Current Password"
            labelPlacement="outside"
            placeholder="Enter current password"
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            isRequired
            value={formData.currentPassword || ""}
            onChange={handleChange("currentPassword")}
            isInvalid={!!errors.currentPassword}
            errorMessage={errors.currentPassword?.[0] || errors.currentPassword}
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
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <Input
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            label="New Password"
            labelPlacement="outside"
            placeholder="Enter new password"
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            isRequired
            value={formData.newPassword || ""}
            onChange={handleChange("newPassword")}
            isInvalid={!!errors.newPassword}
            errorMessage={errors.newPassword?.[0] || errors.newPassword}
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
        </div>
      </div>

      <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2">
          <Input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            label="Confirm New Password"
            labelPlacement="outside"
            placeholder="Confirm new password"
            color="default"
            variant="bordered"
            size="md"
            radius="md"
            isRequired
            value={formData.confirmPassword || ""}
            onChange={handleChange("confirmPassword")}
            isInvalid={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword?.[0] || errors.confirmPassword}
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
        </div>
      </div>

      {success && (
        <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
          <div className="w-full p-3 bg-success-100 text-success-700 rounded-lg text-sm text-center">
            Password changed successfully!
          </div>
        </div>
      )}

      <div className="flex flex-row items-center justify-end w-full h-fit p-2 gap-2">
        <div className="flex items-center justify-end w-full h-full p-2 gap-2">
          <Button
            type="submit"
            color="primary"
            variant="shadow"
            size="md"
            radius="md"
            className="w-2/12 text-background"
            isLoading={isLoading}
            isDisabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>

      <div className="flex flex-row items-center justify-end w-full h-full p-2 gap-2">
        <div className="flex items-end justify-center h-full p-2 gap-2">
          Update By : {operatedBy}
        </div>
      </div>
    </form>
  );
}
