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
  createLogger,
  handlePrismaUniqueError,
} from "@/lib/shared/server";

const ENTITY_NAME = "Department";
const ENTITY_KEY = "departments";
const ENTITY_SINGULAR = "department";

const EMPLOYEE_SELECT = {
  employeeId: true,
  employeeFirstName: true,
  employeeLastName: true,
};

export const createSchema = z.object({
  departmentName: preprocessString("Please provide departmentName"),
  departmentCreatedBy: preprocessString("Please provide the creator ID"),
});

export const updateSchema = z.object({
  departmentId: preprocessString("Please provide the department ID"),
  departmentName: preprocessString("Please provide departmentName"),
  departmentStatus: preprocessEnum(
    ["Active", "Inactive"],
    "Please provide departmentStatus"
  ),
  departmentUpdatedBy: preprocessString("Please provide the updater ID"),
});

export const DepartmentRepository = {
  async findMany(skip = 0, take = 10) {
    return prisma.department.findMany({
      skip,
      take,
      orderBy: { departmentCreatedAt: "asc" },
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async count() {
    return prisma.department.count();
  },

  async findById(id) {
    return prisma.department.findUnique({
      where: { departmentId: id },
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async findByName(name) {
    return prisma.department.findUnique({
      where: { departmentName: name },
    });
  },

  async create(data) {
    return prisma.department.create({
      data,
      include: { createdByEmployee: { select: EMPLOYEE_SELECT } },
    });
  },

  async update(id, data) {
    return prisma.department.update({
      where: { departmentId: id },
      data,
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },
};

export const DepartmentService = {
  async getPaginated(skip, take) {
    const [items, total] = await Promise.all([
      DepartmentRepository.findMany(skip, take),
      DepartmentRepository.count(),
    ]);
    return { items, total };
  },

  async findById(id) {
    return DepartmentRepository.findById(id);
  },

  async ensureNameNotDuplicate(name, excludeId = null) {
    const existing = await DepartmentRepository.findByName(name);
    if (existing && existing.departmentId !== excludeId) {
      const { ConflictError } = await import("@/lib/shared/server");
      throw new ConflictError("departmentName", name);
    }
  },

  async create(data) {
    return DepartmentRepository.create(data);
  },

  async update(id, data) {
    return DepartmentRepository.update(id, data);
  },
};

export async function GetAllUseCase(page = 1, limit = PAGINATION.DEFAULT_LIMIT) {
  const log = createLogger("GetAllDepartmentUseCase");
  log.start({ page, limit });

  try {
    const skip = (page - 1) * limit;
    const { items, total } = await DepartmentService.getPaginated(skip, limit);

    log.success({ total, returned: items.length });
    return { items, total };
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function GetByIdUseCase(id) {
  const log = createLogger("GetDepartmentByIdUseCase");
  log.start({ id });

  try {
    if (!id || typeof id !== "string") {
      throw new BadRequestError(`Invalid ${ENTITY_NAME} ID`);
    }

    const item = await DepartmentService.findById(id);
    if (!item) {
      throw new NotFoundError(ENTITY_NAME);
    }

    log.success({ id, name: item.departmentName });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function CreateUseCase(data) {
  const log = createLogger("CreateDepartmentUseCase");
  log.start({ name: data?.departmentName });

  try {
    const validated = validateOrThrow(createSchema, data);
    const normalizedName = normalizeString(validated.departmentName);

    await DepartmentService.ensureNameNotDuplicate(normalizedName);

    const item = await DepartmentService.create({
      ...validated,
      departmentName: normalizedName,
      departmentCreatedAt: getLocalNow(),
    });

    log.success({ id: item.departmentId, name: item.departmentName });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    handlePrismaUniqueError(error, "departmentName", data?.departmentName);
    throw error;
  }
}

export async function UpdateUseCase(data) {
  const log = createLogger("UpdateDepartmentUseCase");
  log.start({ id: data?.departmentId });

  try {
    const validated = validateOrThrow(updateSchema, data);
    const { departmentId, ...updateData } = validated;

    const existing = await DepartmentService.findById(departmentId);
    if (!existing) {
      throw new NotFoundError(ENTITY_NAME);
    }

    const normalizedName = normalizeString(updateData.departmentName);
    const existingName = normalizeString(existing.departmentName);

    if (normalizedName !== existingName) {
      await DepartmentService.ensureNameNotDuplicate(
        normalizedName,
        departmentId
      );
    }

    const item = await DepartmentService.update(departmentId, {
      ...updateData,
      departmentName: normalizedName,
      departmentUpdatedAt: getLocalNow(),
    });

    log.success({ id: departmentId, name: item.departmentName });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    handlePrismaUniqueError(error, "departmentName", data?.departmentName);
    throw error;
  }
}

export function formatDepartmentData(items) {
  return formatData(items, [], ["departmentCreatedAt", "departmentUpdatedAt"]);
}

const baseController = createBaseController({
  getAllUseCase: GetAllUseCase,
  getByIdUseCase: GetByIdUseCase,
  createUseCase: CreateUseCase,
  updateUseCase: (data) => UpdateUseCase({ ...data, departmentId: data.id }),
  formatData: formatDepartmentData,
  entityKey: ENTITY_KEY,
  entitySingular: ENTITY_SINGULAR,
});

export const getAllDepartment = baseController.getAll;
export const getDepartmentById = baseController.getById;
export const createDepartment = baseController.create;
export const updateDepartment = baseController.update;
