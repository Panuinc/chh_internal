import { z } from "zod";
import {
  preprocessString,
  preprocessEnum,
  formatData,
} from "@/lib/zodSchema";

export const permissionPostSchema = z.object({
  permissionName: preprocessString("Please provide permissionName"),
  permissionCreatedBy: preprocessString("Please provide the creator ID"),
});

export const permissionPutSchema = z.object({
  permissionId: preprocessString("Please provide the permission ID"),
  permissionName: preprocessString("Please permissionName"),
  permissionStatus: preprocessEnum(
    ["Active", "Inactive"],
    "Please provide permissionStatus"
  ),
  permissionUpdatedBy: preprocessString("Please provide the updater ID"),
});

export const formatPermissionData = (permissions) => {
  return formatData(
    permissions,
    ["permissionCreatedAt", "permissionUpdatedAt"],
    []
  );
};
