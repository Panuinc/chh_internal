import prisma from "@/lib/prisma";
import { PAGINATION } from "@/config/app.config";
import { getLocalNow } from "@/lib/getLocalNow";
import { z } from "zod";
import { preprocessString, preprocessEnum, formatData } from "@/lib/zodSchema";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  validateOrThrow,
  normalizeString,
  createBaseController,
  handlePrismaUniqueError,
} from "@/lib/shared/server";
import { createLogger } from "@/lib/logger.node";

const ENTITY_NAME = "RolePermission";
const ENTITY_KEY = "rolePermissions";
const ENTITY_SINGULAR = "rolePermission";

const PERMISSION_SELECT = {
  permissionId: true,
  permissionName: true,
  permissionStatus: true,
};

const ROLE_SELECT = {
  roleId: true,
  roleName: true,
  roleStatus: true,
};

const EMPLOYEE_SELECT = {
  employeeId: true,
  employeeFirstName: true,
  employeeLastName: true,
};

// Validation Schemas
export const syncRolePermissionsSchema = z.object({
  roleId: preprocessString("Please provide roleId"),
  permissionIds: z.array(z.string()).min(0, "permissionIds must be an array"),
  updatedBy: preprocessString("Please provide the updater ID"),
});

// Repository
export const RolePermissionRepository = {
  async findByRole(roleId) {
    return prisma.rolePermission.findMany({
      where: { rolePermissionRoleId: roleId },
      include: {
        permission: { select: PERMISSION_SELECT },
        createdBy: { select: EMPLOYEE_SELECT },
        updatedBy: { select: EMPLOYEE_SELECT },
      },
      orderBy: { rolePermissionCreatedAt: "asc" },
    });
  },

  async findByRoleAndPermission(roleId, permissionId) {
    return prisma.rolePermission.findFirst({
      where: {
        rolePermissionRoleId: roleId,
        rolePermissionPermissionId: permissionId,
      },
    });
  },

  async create(data) {
    return prisma.rolePermission.create({
      data,
      include: {
        permission: { select: PERMISSION_SELECT },
        createdBy: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async createMany(dataArray) {
    return prisma.rolePermission.createMany({
      data: dataArray,
      skipDuplicates: true,
    });
  },

  async delete(rolePermissionId) {
    return prisma.rolePermission.delete({
      where: { rolePermissionId },
    });
  },

  async deleteByRoleAndPermissions(roleId, permissionIds) {
    return prisma.rolePermission.deleteMany({
      where: {
        rolePermissionRoleId: roleId,
        rolePermissionPermissionId: { in: permissionIds },
      },
    });
  },

  async deleteByRole(roleId) {
    return prisma.rolePermission.deleteMany({
      where: { rolePermissionRoleId: roleId },
    });
  },
};

// Service
export const RolePermissionService = {
  async getByRole(roleId) {
    return RolePermissionRepository.findByRole(roleId);
  },

  async syncPermissions(roleId, permissionIds, updatedBy) {
    // Get current permissions for this role
    const currentPermissions = await RolePermissionRepository.findByRole(roleId);
    const currentPermissionIds = currentPermissions.map(
      (rp) => rp.rolePermissionPermissionId
    );

    // Calculate differences
    const toAdd = permissionIds.filter((id) => !currentPermissionIds.includes(id));
    const toRemove = currentPermissionIds.filter((id) => !permissionIds.includes(id));

    const now = getLocalNow();

    // Execute changes in transaction
    await prisma.$transaction(async (tx) => {
      // Add new permissions
      if (toAdd.length > 0) {
        const dataToCreate = toAdd.map((permissionId) => ({
          rolePermissionRoleId: roleId,
          rolePermissionPermissionId: permissionId,
          rolePermissionCreatedBy: updatedBy,
          rolePermissionCreatedAt: now,
          rolePermissionUpdatedBy: updatedBy,
          rolePermissionUpdatedAt: now,
        }));
        await tx.rolePermission.createMany({
          data: dataToCreate,
          skipDuplicates: true,
        });
      }

      // Remove old permissions
      if (toRemove.length > 0) {
        await tx.rolePermission.deleteMany({
          where: {
            rolePermissionRoleId: roleId,
            rolePermissionPermissionId: { in: toRemove },
          },
        });
      }
    });

    return {
      added: toAdd.length,
      removed: toRemove.length,
      roleId,
    };
  },

  async getPermissionsByRoles(roleIds) {
    if (!roleIds || roleIds.length === 0) return [];

    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        rolePermissionRoleId: { in: roleIds },
      },
      include: {
        permission: { select: PERMISSION_SELECT },
      },
    });

    // Return unique permissions
    const permissionMap = new Map();
    rolePermissions.forEach((rp) => {
      if (!permissionMap.has(rp.permission.permissionId)) {
        permissionMap.set(rp.permission.permissionId, rp.permission);
      }
    });

    return Array.from(permissionMap.values());
  },
};

// Use Cases
export async function GetByRoleUseCase(roleId) {
  const log = createLogger("GetRolePermissionsUseCase");
  log.start({ roleId });

  try {
    if (!roleId || typeof roleId !== "string") {
      throw new BadRequestError("Invalid Role ID");
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { roleId },
      select: { roleId: true, roleName: true },
    });

    if (!role) {
      throw new NotFoundError("Role");
    }

    const items = await RolePermissionService.getByRole(roleId);

    log.success({ roleId, total: items.length });
    return { role, permissions: items };
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function SyncRolePermissionsUseCase(data) {
  const log = createLogger("SyncRolePermissionsUseCase");
  log.start({ roleId: data?.roleId });

  try {
    const validated = validateOrThrow(syncRolePermissionsSchema, data);
    const { roleId, permissionIds, updatedBy } = validated;

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { roleId },
      select: { roleId: true, roleName: true },
    });

    if (!role) {
      throw new NotFoundError("Role");
    }

    // Validate all permissionIds exist
    if (permissionIds.length > 0) {
      const existingPermissions = await prisma.permission.findMany({
        where: {
          permissionId: { in: permissionIds },
        },
        select: { permissionId: true },
      });

      const existingIds = existingPermissions.map((p) => p.permissionId);
      const invalidIds = permissionIds.filter((id) => !existingIds.includes(id));

      if (invalidIds.length > 0) {
        throw new BadRequestError(
          `Invalid permission IDs: ${invalidIds.join(", ")}`
        );
      }
    }

    const result = await RolePermissionService.syncPermissions(
      roleId,
      permissionIds,
      updatedBy
    );

    log.success(result);
    return result;
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

// API Controllers
export async function getRolePermissions(request, roleId) {
  try {
    const result = await GetByRoleUseCase(roleId);
    return Response.json(result);
  } catch (error) {
    const status =
      error.name === "NotFoundError"
        ? 404
        : error.name === "BadRequestError"
        ? 400
        : 500;
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status }
    );
  }
}

export async function syncRolePermissions(request) {
  try {
    const body = await request.json();
    const result = await SyncRolePermissionsUseCase(body);

    return Response.json({
      message: `Role permissions updated successfully. Added: ${result.added}, Removed: ${result.removed}`,
      ...result,
    });
  } catch (error) {
    const status =
      error.name === "NotFoundError"
        ? 404
        : error.name === "BadRequestError"
        ? 400
        : error.name === "ValidationError"
        ? 422
        : 500;

    return Response.json(
      {
        error: error.message || "Internal Server Error",
        details: error.details || null,
      },
      { status }
    );
  }
}
