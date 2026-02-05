import prisma from "@/lib/prisma";
import { PAGINATION } from "@/config/app.config";
import { getLocalNow } from "@/lib/getLocalNow";
import { z } from "zod";
import { preprocessString, preprocessEnum, formatData } from "@/lib/zodSchema";
import {
  NotFoundError,
  BadRequestError,
  validateOrThrow,
  normalizeString,
  createBaseController,
  handlePrismaUniqueError,
} from "@/lib/shared/server";
import { createLogger } from "@/lib/logger.node";

const ENTITY_NAME = "Role";
const ENTITY_KEY = "roles";
const ENTITY_SINGULAR = "role";

const EMPLOYEE_SELECT = {
  employeeId: true,
  employeeFirstName: true,
  employeeLastName: true,
};

export const createSchema = z.object({
  roleName: preprocessString("Please provide roleName"),
  roleCreatedBy: preprocessString("Please provide the creator ID"),
});

export const updateSchema = z.object({
  roleId: preprocessString("Please provide the role ID"),
  roleName: preprocessString("Please provide roleName"),
  roleStatus: preprocessEnum(
    ["Active", "Inactive"],
    "Please provide roleStatus"
  ),
  roleUpdatedBy: preprocessString("Please provide the updater ID"),
});

export const RoleRepository = {
  async findMany(skip = 0, take = 10) {
    return prisma.role.findMany({
      skip,
      take,
      orderBy: { roleCreatedAt: "asc" },
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async count() {
    return prisma.role.count();
  },

  async findById(id) {
    return prisma.role.findUnique({
      where: { roleId: id },
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async findByName(name) {
    return prisma.role.findUnique({
      where: { roleName: name },
    });
  },

  async create(data) {
    return prisma.role.create({
      data,
      include: { createdByEmployee: { select: EMPLOYEE_SELECT } },
    });
  },

  async update(id, data) {
    return prisma.role.update({
      where: { roleId: id },
      data,
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },
};

export const RoleService = {
  async getPaginated(skip, take) {
    const [items, total] = await Promise.all([
      RoleRepository.findMany(skip, take),
      RoleRepository.count(),
    ]);
    return { items, total };
  },

  async findById(id) {
    return RoleRepository.findById(id);
  },

  async ensureNameNotDuplicate(name, excludeId = null) {
    const existing = await RoleRepository.findByName(name);
    if (existing && existing.roleId !== excludeId) {
      const { ConflictError } = await import("@/lib/shared/server");
      throw new ConflictError("roleName", name);
    }
  },

  async create(data) {
    return RoleRepository.create(data);
  },

  async update(id, data) {
    return RoleRepository.update(id, data);
  },
};

export async function GetAllUseCase(page = 1, limit = PAGINATION.DEFAULT_LIMIT) {
  const log = createLogger("GetAllRoleUseCase");
  log.start({ page, limit });

  try {
    const skip = (page - 1) * limit;
    const { items, total } = await RoleService.getPaginated(skip, limit);

    log.success({ total, returned: items.length });
    return { items, total };
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function GetByIdUseCase(id) {
  const log = createLogger("GetRoleByIdUseCase");
  log.start({ id });

  try {
    if (!id || typeof id !== "string") {
      throw new BadRequestError(`Invalid ${ENTITY_NAME} ID`);
    }

    const item = await RoleService.findById(id);
    if (!item) {
      throw new NotFoundError(ENTITY_NAME);
    }

    log.success({ id, name: item.roleName });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function CreateUseCase(data) {
  const log = createLogger("CreateRoleUseCase");
  log.start({ name: data?.roleName });

  try {
    const validated = validateOrThrow(createSchema, data);
    const normalizedName = normalizeString(validated.roleName);

    await RoleService.ensureNameNotDuplicate(normalizedName);

    const item = await RoleService.create({
      ...validated,
      roleName: normalizedName,
      roleCreatedAt: getLocalNow(),
    });

    log.success({ id: item.roleId, name: item.roleName });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    handlePrismaUniqueError(error, "roleName", data?.roleName);
    throw error;
  }
}

export async function UpdateUseCase(data) {
  const log = createLogger("UpdateRoleUseCase");
  log.start({ id: data?.roleId });

  try {
    const validated = validateOrThrow(updateSchema, data);
    const { roleId, ...updateData } = validated;

    const existing = await RoleService.findById(roleId);
    if (!existing) {
      throw new NotFoundError(ENTITY_NAME);
    }

    const normalizedName = normalizeString(updateData.roleName);
    const existingName = normalizeString(existing.roleName);

    if (normalizedName !== existingName) {
      await RoleService.ensureNameNotDuplicate(normalizedName, roleId);
    }

    const item = await RoleService.update(roleId, {
      ...updateData,
      roleName: normalizedName,
      roleUpdatedAt: getLocalNow(),
    });

    log.success({ id: roleId, name: item.roleName });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    handlePrismaUniqueError(error, "roleName", data?.roleName);
    throw error;
  }
}

export function formatRoleData(items) {
  return formatData(items, [], ["roleCreatedAt", "roleUpdatedAt"]);
}

const baseController = createBaseController({
  getAllUseCase: GetAllUseCase,
  getByIdUseCase: GetByIdUseCase,
  createUseCase: CreateUseCase,
  updateUseCase: (data) => UpdateUseCase({ ...data, roleId: data.id }),
  formatData: formatRoleData,
  entityKey: ENTITY_KEY,
  entitySingular: ENTITY_SINGULAR,
});

export const getAllRole = baseController.getAll;
export const getRoleById = baseController.getById;
export const createRole = baseController.create;
export const updateRole = baseController.update;
