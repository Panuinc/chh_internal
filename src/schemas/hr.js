import { z } from "zod";
import {
  preprocessString,
  preprocessEmail,
  preprocessEnum,
  STATUS_VALUES,
} from "./common";

export const employeeCreateSchema = z.object({
  employeeFirstName: preprocessString("Please provide employeeFirstName"),
  employeeLastName: preprocessString("Please provide employeeLastName"),
  employeeEmail: preprocessEmail("Please provide employeeEmail"),
  employeeDepartmentId: preprocessString(
    "Please provide employeeDepartmentId",
  ).optional(),
  employeeRoleId: preprocessString("Please provide employeeRoleId").optional(),
  employeeCreatedBy: preprocessString("Please provide the creator ID"),
});

export const employeeUpdateSchema = z.object({
  employeeId: preprocessString("Please provide the employee ID"),
  employeeFirstName: preprocessString("Please provide employeeFirstName"),
  employeeLastName: preprocessString("Please provide employeeLastName"),
  employeeEmail: preprocessEmail("Please provide employeeEmail"),
  employeeDepartmentId: preprocessString(
    "Please provide employeeDepartmentId",
  ).optional(),
  employeeRoleId: preprocessString("Please provide employeeRoleId").optional(),
  employeeStatus: preprocessEnum(
    STATUS_VALUES.EMPLOYEE,
    "Please provide employeeStatus",
  ),
  employeeUpdatedBy: preprocessString("Please provide the updater ID"),
});

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

export const departmentCreateSchema = z.object({
  departmentName: preprocessString("Please provide departmentName"),
  departmentCreatedBy: preprocessString("Please provide the creator ID"),
});

export const departmentUpdateSchema = z.object({
  departmentId: preprocessString("Please provide the department ID"),
  departmentName: preprocessString("Please provide departmentName"),
  departmentStatus: preprocessEnum(
    STATUS_VALUES.DEPARTMENT,
    "Please provide departmentStatus",
  ),
  departmentUpdatedBy: preprocessString("Please provide the updater ID"),
});

export const permissionCreateSchema = z.object({
  permissionName: preprocessString("Please provide permissionName"),
  permissionCreatedBy: preprocessString("Please provide the creator ID"),
});

export const permissionUpdateSchema = z.object({
  permissionId: preprocessString("Please provide the permission ID"),
  permissionName: preprocessString("Please provide permissionName"),
  permissionStatus: preprocessEnum(
    STATUS_VALUES.PERMISSION,
    "Please provide permissionStatus",
  ),
  permissionUpdatedBy: preprocessString("Please provide the updater ID"),
});

export const assignCreateSchema = z.object({
  assignEmployeeId: preprocessString("Please provide assignEmployeeId"),
  assignPermissionId: preprocessString("Please provide assignPermissionId"),
  assignCreatedBy: preprocessString("Please provide the creator ID"),
});

export const assignUpdateSchema = z.object({
  assignId: preprocessString("Please provide the assign ID"),
  assignEmployeeId: preprocessString("Please provide assignEmployeeId"),
  assignPermissionId: preprocessString("Please provide assignPermissionId"),
  assignUpdatedBy: preprocessString("Please provide the updater ID"),
});
