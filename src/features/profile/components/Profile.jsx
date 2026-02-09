"use client";

import React, { useEffect } from "react";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Chip } from "@heroui/chip";
import { Card, CardBody, CardHeader } from "@heroui/card";
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
    <div className="flex flex-col xl:flex-row items-center justify-start w-full h-full gap-2 overflow-auto">
      {/* Profile Info Card */}
      <div className="flex flex-col items-center justify-start w-full xl:w-4/12 h-full gap-2 border-l-2 border-r-2 border-default overflow-auto">
        <div className="flex flex-col items-center justify-center w-full h-fit p-4 gap-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            <Avatar
              name={initials}
              className="w-24 h-24 text-2xl"
              color="primary"
              isBordered
            />
            <div className="text-center">
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-default-500 text-sm">@{username}</p>
            </div>
            {isSuperAdmin && (
              <Badge color="danger" content="ADMIN" placement="bottom-right">
                <span className="sr-only">Super Admin</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="flex flex-col w-full h-fit p-2 gap-2">
          <div className="flex items-center gap-3 p-3 bg-default-100 rounded-lg">
            <Mail className="w-5 h-5 text-default-500" />
            <div>
              <p className="text-xs text-default-500">Email</p>
              <p className="text-sm font-medium">{email || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-default-100 rounded-lg">
            <Key className="w-5 h-5 text-default-500" />
            <div>
              <p className="text-xs text-default-500">Username</p>
              <p className="text-sm font-medium">{username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-default-100 rounded-lg">
            <Shield className="w-5 h-5 text-default-500" />
            <div className="flex-1">
              <p className="text-xs text-default-500">Role</p>
              <p className="text-sm font-medium">
                {isSuperAdmin ? "Super Administrator" : "User"}
              </p>
            </div>
          </div>
        </div>

        {/* Permissions */}
        <div className="flex flex-col w-full h-fit p-2 gap-2">
          <p className="text-xs text-default-500 px-2">Permissions</p>
          <div className="flex flex-wrap gap-2 px-2">
            {isSuperAdmin ? (
              <Chip size="sm" variant="flat" color="danger">
                All Permissions (Super Admin)
              </Chip>
            ) : (
              <>
                {permissions.slice(0, 8).map((permission) => (
                  <Chip
                    key={permission}
                    size="sm"
                    variant="flat"
                    color="primary"
                  >
                    {permission}
                  </Chip>
                ))}
                {permissions.length > 8 && (
                  <Chip size="sm" variant="flat" color="default">
                    +{permissions.length - 8} more
                  </Chip>
                )}
              </>
            )}
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="flex flex-col items-center justify-center w-full h-fit p-2 gap-2 mt-4">
          <Link href="/home" className="w-full">
            <Button
              color="primary"
              variant="shadow"
              size="md"
              radius="md"
              className="w-6/12 text-background"
              startContent={<Home className="w-4 h-4" />}
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="flex flex-col items-center justify-start w-full xl:w-8/12 h-full gap-2 border-r-2 border-default overflow-auto">
        <div className="flex flex-col xl:flex-row items-center justify-center w-full h-fit p-2 gap-2">
          <div className="flex items-center justify-center w-full h-full p-2 gap-2">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Change Password</h3>
            </div>
          </div>
        </div>

        <ChangePasswordForm
          formHandler={formHandler}
          operatedBy={displayName}
          success={success}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
