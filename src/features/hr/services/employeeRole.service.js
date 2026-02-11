import prisma from "@/lib/prisma";
import { getLocalNow } from "@/lib/getLocalNow";
import { z } from "zod";
import { preprocessString, formatData } from "@/lib/zodSchema";
import {
  NotFoundError,
  BadRequestError,
  validateOrThrow,
} from "@/lib/shared/server";
import { createLogger } from "@/lib/logger.node";

const ENTITY_NAME = "EmployeeRole";
const EMPLOYEE_SELECT = {
  employeeId: true,
  employeeFirstName: true,
  employeeLastName: true,
  employeeEmail: true,
  employeeStatus: true,
};

const ROLE_SELECT = {
  roleId: true,
  roleName: true,
  roleStatus: true,
};

const PERMISSION_SELECT = {
  permissionId: true,
  permissionName: true,
  permissionStatus: true,
};

export const syncEmployeeRolesSchema = z.object({
  employeeId: preprocessString("Please provide employeeId"),
  roleIds: z.array(z.string()).min(0, "roleIds must be an array"),
  updatedBy: preprocessString("Please provide the updater ID"),
});

export const EmployeeRoleRepository = {
  async findByEmployee(employeeId) {
    return prisma.employeeRole.findMany({
      where: { employeeRoleEmployeeId: employeeId },
      include: {
        role: { select: ROLE_SELECT },
        createdBy: { select: EMPLOYEE_SELECT },
        updatedBy: { select: EMPLOYEE_SELECT },
      },
      orderBy: { employeeRoleCreatedAt: "asc" },
    });
  },

  async findByEmployeeWithPermissions(employeeId) {
    return prisma.employeeRole.findMany({
      where: { employeeRoleEmployeeId: employeeId },
      include: {
        role: {
          select: {
            ...ROLE_SELECT,
            rolePermissions: {
              include: {
                permission: { select: PERMISSION_SELECT },
              },
            },
          },
        },
      },
    });
  },

  async findByRole(roleId) {
    return prisma.employeeRole.findMany({
      where: { employeeRoleRoleId: roleId },
      include: {
        employee: { select: EMPLOYEE_SELECT },
        createdBy: { select: EMPLOYEE_SELECT },
        updatedBy: { select: EMPLOYEE_SELECT },
      },
      orderBy: { employeeRoleCreatedAt: "asc" },
    });
  },

  async create(data) {
    return prisma.employeeRole.create({
      data,
      include: {
        role: { select: ROLE_SELECT },
        employee: { select: EMPLOYEE_SELECT },
        createdBy: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async createMany(dataArray) {
    return prisma.employeeRole.createMany({
      data: dataArray,
      skipDuplicates: true,
    });
  },

  async delete(employeeRoleId) {
    return prisma.employeeRole.delete({
      where: { employeeRoleId },
    });
  },

  async deleteByEmployeeAndRoles(employeeId, roleIds) {
    return prisma.employeeRole.deleteMany({
      where: {
        employeeRoleEmployeeId: employeeId,
        employeeRoleRoleId: { in: roleIds },
      },
    });
  },

  async deleteByEmployee(employeeId) {
    return prisma.employeeRole.deleteMany({
      where: { employeeRoleEmployeeId: employeeId },
    });
  },
};

export const EmployeeRoleService = {
  async getByEmployee(employeeId) {
    return EmployeeRoleRepository.findByEmployee(employeeId);
  },

  async getByEmployeeWithPermissions(employeeId) {
    return EmployeeRoleRepository.findByEmployeeWithPermissions(employeeId);
  },

  async getByRole(roleId) {
    return EmployeeRoleRepository.findByRole(roleId);
  },

  async getAllPermissions(employeeId) {
    const employeeRoles = await EmployeeRoleRepository.findByEmployeeWithPermissions(
      employeeId
    );

    const permissions = new Set();
    employeeRoles.forEach((er) => {
      if (er.role && er.role.rolePermissions) {
        er.role.rolePermissions.forEach((rp) => {
          if (rp.permission) {
            permissions.add(rp.permission.permissionName);
          }
        });
      }
    });

    return Array.from(permissions);
  },

  async getAllPermissionObjects(employeeId) {
    const employeeRoles = await EmployeeRoleRepository.findByEmployeeWithPermissions(
      employeeId
    );

    const permissionMap = new Map();
    employeeRoles.forEach((er) => {
      if (er.role && er.role.rolePermissions) {
        er.role.rolePermissions.forEach((rp) => {
          if (rp.permission && !permissionMap.has(rp.permission.permissionId)) {
            permissionMap.set(rp.permission.permissionId, rp.permission);
          }
        });
      }
    });

    return Array.from(permissionMap.values());
  },

  async syncRoles(employeeId, roleIds, updatedBy) {
    const currentRoles = await EmployeeRoleRepository.findByEmployee(employeeId);
    const currentRoleIds = currentRoles.map((er) => er.employeeRoleRoleId);

    const toAdd = roleIds.filter((id) => !currentRoleIds.includes(id));
    const toRemove = currentRoleIds.filter((id) => !roleIds.includes(id));

    const now = getLocalNow();

    await prisma.$transaction(async (tx) => {
      if (toAdd.length > 0) {
        const dataToCreate = toAdd.map((roleId) => ({
          employeeRoleEmployeeId: employeeId,
          employeeRoleRoleId: roleId,
          employeeRoleCreatedBy: updatedBy,
          employeeRoleCreatedAt: now,
          employeeRoleUpdatedBy: updatedBy,
          employeeRoleUpdatedAt: now,
        }));
        await tx.employeeRole.createMany({
          data: dataToCreate,
          skipDuplicates: true,
        });
      }

      if (toRemove.length > 0) {
        await tx.employeeRole.deleteMany({
          where: {
            employeeRoleEmployeeId: employeeId,
            employeeRoleRoleId: { in: toRemove },
          },
        });
      }
    });

    return {
      added: toAdd.length,
      removed: toRemove.length,
      employeeId,
    };
  },
};

export async function GetByEmployeeUseCase(employeeId) {
  const log = createLogger("GetEmployeeRolesUseCase");
  log.start({ employeeId });

  try {
    if (!employeeId || typeof employeeId !== "string") {
      throw new BadRequestError("Invalid Employee ID");
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeId },
      select: { employeeId: true, employeeFirstName: true, employeeLastName: true },
    });

    if (!employee) {
      throw new NotFoundError("Employee");
    }

    const items = await EmployeeRoleService.getByEmployee(employeeId);

    log.success({ employeeId, total: items.length });
    return { employee, roles: items };
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function GetEmployeePermissionsUseCase(employeeId) {
  const log = createLogger("GetEmployeePermissionsUseCase");
  log.start({ employeeId });

  try {
    if (!employeeId || typeof employeeId !== "string") {
      throw new BadRequestError("Invalid Employee ID");
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeId },
      select: { employeeId: true, employeeFirstName: true, employeeLastName: true },
    });

    if (!employee) {
      throw new NotFoundError("Employee");
    }

    const permissions = await EmployeeRoleService.getAllPermissions(employeeId);

    log.success({ employeeId, totalPermissions: permissions.length });
    return { employee, permissions };
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function SyncEmployeeRolesUseCase(data) {
  const log = createLogger("SyncEmployeeRolesUseCase");
  log.start({ employeeId: data?.employeeId });

  try {
    const validated = validateOrThrow(syncEmployeeRolesSchema, data);
    const { employeeId, roleIds, updatedBy } = validated;

    const employee = await prisma.employee.findUnique({
      where: { employeeId },
      select: { employeeId: true },
    });

    if (!employee) {
      throw new NotFoundError("Employee");
    }

    if (roleIds.length > 0) {
      const existingRoles = await prisma.role.findMany({
        where: {
          roleId: { in: roleIds },
        },
        select: { roleId: true },
      });

      const existingIds = existingRoles.map((r) => r.roleId);
      const invalidIds = roleIds.filter((id) => !existingIds.includes(id));

      if (invalidIds.length > 0) {
        throw new BadRequestError(
          `Invalid role IDs: ${invalidIds.join(", ")}`
        );
      }
    }

    const result = await EmployeeRoleService.syncRoles(employeeId, roleIds, updatedBy);

    log.success(result);
    return result;
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function getEmployeeRoles(request, employeeId) {
  try {
    const result = await GetByEmployeeUseCase(employeeId);
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

export async function getEmployeePermissions(request, employeeId) {
  try {
    const result = await GetEmployeePermissionsUseCase(employeeId);
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

export async function syncEmployeeRoles(request) {
  try {
    const body = await request.json();
    const result = await SyncEmployeeRolesUseCase(body);

    return Response.json({
      message: `Employee roles updated successfully. Added: ${result.added}, Removed: ${result.removed}`,
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
