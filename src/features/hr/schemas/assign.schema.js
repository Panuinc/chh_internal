import { z } from "zod";
import { preprocessString } from "@/schemas/common";

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
