/**
 * Permission Module - ใช้ Shared Utilities
 * ตัวอย่างการสร้าง entity module แบบ minimal
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getLocalNow } from "@/lib/getLocalNow";
import { preprocessString, preprocessEnum, formatData } from "@/lib/zodSchema";
import {
  // Errors
  NotFoundError,
  BadRequestError,
  
  // Schema helpers
  validateOrThrow,
  normalizeString,
  
  // Controller helpers
  createBaseController,
  
  // Logger helpers
  createLogger,
  handlePrismaUniqueError,
} from "@/lib/shared/server";  // ⚠️ ใช้ /server สำหรับ server-side

// ============================================================
// Constants (Entity-specific)
// ============================================================

const ENTITY_NAME = "Permission";
const EMPLOYEE_SELECT = {
  employeeId: true,
  employeeFirstName: true,
  employeeLastName: true,
};

// ============================================================
// Schemas
// ============================================================

export const createSchema = z.object({
  permissionName: preprocessString("Please provide permissionName"),
  permissionCreatedBy: preprocessString("Please provide the creator ID"),
});

export const updateSchema = z.object({
  permissionId: preprocessString("Please provide the permission ID"),
  permissionName: preprocessString("Please provide permissionName"),
  permissionStatus: preprocessEnum(["Active", "Inactive"], "Please provide permissionStatus"),
  permissionUpdatedBy: preprocessString("Please provide the updater ID"),
});

// ============================================================
// Repository
// ============================================================

export const PermissionRepository = {
  async findMany(skip = 0, take = 10) {
    return prisma.permission.findMany({
      skip,
      take,
      orderBy: { permissionCreatedAt: "asc" },
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async count() {
    return prisma.permission.count();
  },

  async findById(id) {
    return prisma.permission.findUnique({
      where: { permissionId: id },
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async findByName(name) {
    return prisma.permission.findUnique({
      where: { permissionName: name },
    });
  },

  async create(data) {
    return prisma.permission.create({
      data,
      include: { createdByEmployee: { select: EMPLOYEE_SELECT } },
    });
  },

  async update(id, data) {
    return prisma.permission.update({
      where: { permissionId: id },
      data,
      include: { updatedByEmployee: { select: EMPLOYEE_SELECT } },
    });
  },
};

// ============================================================
// Service
// ============================================================

export const PermissionService = {
  async getPaginated(skip, take) {
    const [items, total] = await Promise.all([
      PermissionRepository.findMany(skip, take),
      PermissionRepository.count(),
    ]);
    return { items, total };
  },

  async findById(id) {
    return PermissionRepository.findById(id);
  },

  async ensureNameNotDuplicate(name, excludeId = null) {
    const existing = await PermissionRepository.findByName(name);
    if (existing && existing.permissionId !== excludeId) {
      const { ConflictError } = await import("@/lib/shared/server");
      throw new ConflictError("permissionName", name);
    }
  },

  async create(data) {
    return PermissionRepository.create(data);
  },

  async update(id, data) {
    return PermissionRepository.update(id, data);
  },
};

// ============================================================
// Use Cases
// ============================================================

export async function GetAllUseCase(page = 1, limit = 1000000) {
  const log = createLogger("GetAllPermissionUseCase");
  log.start({ page, limit });

  const skip = (page - 1) * limit;
  const { items, total } = await PermissionService.getPaginated(skip, limit);

  log.success({ total, returned: items.length });
  return { items, total };
}

export async function GetByIdUseCase(id) {
  const log = createLogger("GetPermissionByIdUseCase");
  log.start({ id });

  if (!id || typeof id !== "string") {
    throw new BadRequestError(`Invalid ${ENTITY_NAME} ID`);
  }

  const item = await PermissionService.findById(id);
  if (!item) {
    throw new NotFoundError(ENTITY_NAME);
  }

  log.success({ id, name: item.permissionName });
  return item;
}

export async function CreateUseCase(data) {
  const log = createLogger("CreatePermissionUseCase");
  log.start({ name: data?.permissionName });

  const validated = validateOrThrow(createSchema, data);
  const normalizedName = normalizeString(validated.permissionName);

  await PermissionService.ensureNameNotDuplicate(normalizedName);

  try {
    const item = await PermissionService.create({
      ...validated,
      permissionName: normalizedName,
      permissionCreatedAt: getLocalNow(),
    });

    log.success({ id: item.permissionId, name: item.permissionName });
    return item;
  } catch (error) {
    handlePrismaUniqueError(error, "permissionName", normalizedName);
  }
}

export async function UpdateUseCase(data) {
  const log = createLogger("UpdatePermissionUseCase");
  log.start({ id: data?.permissionId });

  const validated = validateOrThrow(updateSchema, data);
  const { permissionId, ...updateData } = validated;

  const existing = await PermissionService.findById(permissionId);
  if (!existing) {
    throw new NotFoundError(ENTITY_NAME);
  }

  const normalizedName = normalizeString(updateData.permissionName);
  const existingName = normalizeString(existing.permissionName);

  if (normalizedName !== existingName) {
    await PermissionService.ensureNameNotDuplicate(normalizedName, permissionId);
  }

  try {
    const item = await PermissionService.update(permissionId, {
      ...updateData,
      permissionName: normalizedName,
      permissionUpdatedAt: getLocalNow(),
    });

    log.success({ id: permissionId, name: item.permissionName });
    return item;
  } catch (error) {
    handlePrismaUniqueError(error, "permissionName", normalizedName);
  }
}

// ============================================================
// Formatter
// ============================================================

export function formatPermissionData(items) {
  return formatData(items, ["permissionCreatedAt", "permissionUpdatedAt"], []);
}

// ============================================================
// Controller (using factory)
// ============================================================

const baseController = createBaseController({
  getAllUseCase: GetAllUseCase,
  getByIdUseCase: GetByIdUseCase,
  createUseCase: CreateUseCase,
  updateUseCase: (data) => UpdateUseCase({ ...data, permissionId: data.id }),
  formatData: formatPermissionData,
});

// Export controller methods
export const getAllPermission = baseController.getAll;
export const getPermissionById = baseController.getById;
export const createPermission = baseController.create;
export const updatePermission = (request, id) => {
  // Override to pass permissionId correctly
  return (async () => {
    const data = await request.json();
    const item = await UpdateUseCase({ ...data, permissionId: id });
    const { successResponse, SUCCESS_MESSAGES } = await import("@/lib/shared/server");
    return successResponse({
      message: SUCCESS_MESSAGES.UPDATED,
      permission: formatPermissionData([item])[0],
    });
  })().catch(async (error) => {
    const { errorResponse } = await import("@/lib/shared/server");
    return errorResponse(error);
  });
};