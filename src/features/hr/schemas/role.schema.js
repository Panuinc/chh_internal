import { z } from "zod";
import {
  preprocessString,
  preprocessEnum,
  STATUS_VALUES,
} from "@/lib/zodSchema";

export const roleCreateSchema = z.object({
  roleName: preprocessString("Please provide roleName"),
  roleCreatedBy: preprocessString("Please provide the creator ID"),
});

export const roleUpdateSchema = z.object({
  roleId: preprocessString("Please provide the role ID"),
  roleName: preprocessString("Please provide roleName"),
  roleStatus: preprocessEnum(
    STATUS_VALUES.ROLE,
    "Please provide roleStatus",
  ),
  roleUpdatedBy: preprocessString("Please provide the updater ID"),
});
