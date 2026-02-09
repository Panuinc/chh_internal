import { z } from "zod";
import {
  preprocessString,
  preprocessEnum,
  STATUS_VALUES,
} from "@/lib/zodSchema";

export const accountCreateSchema = z.object({
  accountEmployeeId: preprocessString("Please provide accountEmployeeId"),
  accountUsername: preprocessString("Please provide accountUsername"),
  accountPassword: preprocessString("Please provide accountPassword").min(
    6,
    "Password must be at least 6 characters",
  ),
  accountPinNumber: z.string().optional(),
  accountCreatedBy: preprocessString("Please provide the creator ID"),
});

export const accountUpdateSchema = z.object({
  accountId: preprocessString("Please provide the account ID"),
  accountUsername: preprocessString("Please provide accountUsername"),
  accountPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  accountPinNumber: z.string().optional(),
  accountStatus: preprocessEnum(
    STATUS_VALUES.ACCOUNT,
    "Please provide accountStatus",
  ),
  accountUpdatedBy: preprocessString("Please provide the updater ID"),
});

export const changePasswordSchema = z.object({
  currentPassword: preprocessString("Please provide current password"),
  newPassword: preprocessString("Please provide new password").min(
    6,
    "New password must be at least 6 characters",
  ),
  accountUpdatedBy: preprocessString("Please provide the updater ID"),
});
