import { z } from "zod";
import {
  preprocessString,
  preprocessEnum,
  STATUS_VALUES,
} from "@/schemas/common";

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
