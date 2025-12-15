import { z } from "zod";
import prisma from "@/lib/prisma";
import { getLocalNow } from "@/lib/getLocalNow";
import {
  NotFoundError,
  BadRequestError,
  validateOrThrow,
  normalizeString,
  formatData,
  createBaseController,
  createLogger,
  handlePrismaUniqueError,
} from "@/lib/shared/server";

const ENTITY_NAME = "Permission";
const ENTITY_KEY = "permissions";
const ENTITY_SINGULAR = "permission";

const EMPLOYEE_SELECT = {
  employeeId: true,
  employeeFirstName: true,
  employeeLastName: true,
};

const preprocessString = (message) =>
  z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.string({ required_error: message }).min(1, message)
  );

const preprocessEnum = (values, message) =>
  z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    z.enum(values, { required_error: message })
  );

export const createSchema = z.object({
  permissionName: preprocessString("Please provide permissionName"),
  permissionCreatedBy: preprocessString("Please provide the creator ID"),
});

export const updateSchema = z.object({
  permissionId: preprocessString("Please provide the permission ID"),
  permissionName: preprocessString("Please provide permissionName"),
  permissionStatus: preprocessEnum(
    ["Active", "Inactive"],
    "Please provide permissionStatus"
  ),
  permissionUpdatedBy: preprocessString("Please provide the updater ID"),
});

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
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },
};

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
    await PermissionService.ensureNameNotDuplicate(
      normalizedName,
      permissionId
    );
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

export function formatPermissionData(items) {
  return formatData(items, ["permissionCreatedAt", "permissionUpdatedAt"], []);
}

const baseController = createBaseController({
  getAllUseCase: GetAllUseCase,
  getByIdUseCase: GetByIdUseCase,
  createUseCase: CreateUseCase,
  updateUseCase: (data) => UpdateUseCase({ ...data, permissionId: data.id }),
  formatData: formatPermissionData,
  entityKey: ENTITY_KEY,
  entitySingular: ENTITY_SINGULAR,
});

export const getAllPermission = baseController.getAll;
export const getPermissionById = baseController.getById;
export const createPermission = baseController.create;
export const updatePermission = baseController.update;
