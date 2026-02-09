import { z } from "zod";
import {
  preprocessString,
  preprocessEmail,
  preprocessEnum,
  STATUS_VALUES,
} from "@/lib/zodSchema";

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
