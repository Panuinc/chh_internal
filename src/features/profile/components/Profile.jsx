"use client";

import React, { useEffect } from "react";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { User, Mail, Shield, Key, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@heroui/button";
import { useFormHandler } from "@/hooks/useFormHandler";
import { useChangePassword } from "@/features/profile/hooks/useChangePassword";
import ChangePasswordForm from "./ChangePasswordForm";

export default function UIProfile({ user }) {
  const {
    name,
    username,
    email,
    firstName,
    lastName,
    permissions = [],
    isSuperAdmin,
  } = user;

  const { changePassword, isLoading, error, success, resetState } =
    useChangePassword();

  const displayName = name || `${firstName || ""} ${lastName || ""}`.trim();
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const validateForm = (data) => {
    const errors = {};

    if (!data.currentPassword) {
      errors.currentPassword = "Please enter current password";
    }

    if (!data.newPassword) {
      errors.newPassword = "Please enter new password";
    } else if (data.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = "Please confirm new password";
    } else if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleSubmitForm = async (formRef, formData, setErrors) => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await changePassword(
      formData.currentPassword,
      formData.newPassword
    );

    if (!result.success) {
      setErrors({
        currentPassword: result.error,
      });
    }
  };

  const formHandler = useFormHandler(
    {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    handleSubmitForm
  );

  const { setFormData } = formHandler;

  useEffect(() => {
    if (success) {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      const timer = setTimeout(() => {
        resetState();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, setFormData, resetState]);

  return (
    <div className="flex flex-col w-full h-full overflow-auto">
      <div className="w-full h-full p-2 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Profile</h1>
            <p className="text-[13px] text-default-400">Manage your account settings</p>
          </div>
          <Link href="/home">
            <Button
              size="sm"
              radius="sm"
              variant="bordered"
              className="border-default text-default-700 hover:bg-default-50"
              startContent={<Home className="w-3.5 h-3.5" />}
            >
              Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex flex-col xl:flex-row gap-2">
          <div className="xl:w-80 shrink-0 space-y-4">
            <div className="bg-background rounded-lg border-1 border-default p-2">
              <div className="flex flex-col items-center gap-2">
                <Avatar
                  name={initials}
                  className="w-16 h-16 text-lg bg-foreground text-background"
                />
                <div className="text-center">
                  <h2 className="text-base font-semibold text-foreground">{displayName}</h2>
                  <p className="text-xs text-default-500">@{username}</p>
                  {isSuperAdmin && (
                    <Chip size="sm" variant="flat" color="danger">
                      Super Admin
                    </Chip>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-background rounded-lg border-1 border-default p-2 space-y-3">
              <div className="flex items-center gap-2 p-2 bg-default-50 rounded-md">
                <Mail className="w-4 h-4 text-default-400" />
                <div>
                  <p className="text-[11px] text-default-400">Email</p>
                  <p className="text-[12px] font-medium text-default-700">{email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-default-50 rounded-md">
                <Key className="w-4 h-4 text-default-400" />
                <div>
                  <p className="text-[11px] text-default-400">Username</p>
                  <p className="text-[12px] font-medium text-default-700">{username}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-default-50 rounded-md">
                <Shield className="w-4 h-4 text-default-400" />
                <div>
                  <p className="text-[11px] text-default-400">Role</p>
                  <p className="text-[12px] font-medium text-default-700">
                    {isSuperAdmin ? "Super Administrator" : "User"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-background rounded-lg border-1 border-default p-2">
              <p className="text-xs font-medium text-default-400 uppercase tracking-wider">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {isSuperAdmin ? (
                  <Chip size="sm" variant="flat" color="danger" className="text-xs">
                    All Permissions (Super Admin)
                  </Chip>
                ) : (
                  <>
                    {permissions.slice(0, 8).map((permission) => (
                      <Chip
                        key={permission}
                        size="sm"
                        variant="flat"
                        className="text-xs bg-default-100 text-default-600"
                      >
                        {permission}
                      </Chip>
                    ))}
                    {permissions.length > 8 && (
                      <Chip size="sm" variant="flat" className="text-xs bg-default-100 text-default-500">
                        +{permissions.length - 8} more
                      </Chip>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-background rounded-lg border-1 border-default">
              <div className="flex items-center gap-2 p-2 border-b-1 border-default">
                <User className="w-4 h-4 text-default-500" />
                <h3 className="text-[13px] font-semibold text-foreground">Change Password</h3>
              </div>
              <div className="p-2">
                <ChangePasswordForm
                  formHandler={formHandler}
                  operatedBy={displayName}
                  success={success}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
