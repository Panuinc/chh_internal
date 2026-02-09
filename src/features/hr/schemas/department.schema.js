import { z } from "zod";
import {
  preprocessString,
  preprocessEnum,
  STATUS_VALUES,
} from "@/schemas/common";

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
