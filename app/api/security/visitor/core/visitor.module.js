import prisma from "@/lib/prisma";
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

const ENTITY_NAME = "Visitor";
const ENTITY_KEY = "visitors";
const ENTITY_SINGULAR = "visitor";

const EMPLOYEE_SELECT = {
  employeeId: true,
  employeeFirstName: true,
  employeeLastName: true,
};

export const createSchema = z.object({
  visitorName: preprocessString("Please provide visitorName"),
  visitorCreatedBy: preprocessString("Please provide the creator ID"),
});

export const updateSchema = z.object({
  visitorId: preprocessString("Please provide the visitor ID"),
  visitorName: preprocessString("Please provide visitorName"),
  visitorStatus: preprocessEnum(
    ["Active", "Inactive"],
    "Please provide visitorStatus"
  ),
  visitorUpdatedBy: preprocessString("Please provide the updater ID"),
});

export const VisitorRepository = {
  async findMany(skip = 0, take = 10) {
    return prisma.visitor.findMany({
      skip,
      take,
      orderBy: { visitorCreatedAt: "asc" },
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async count() {
    return prisma.visitor.count();
  },

  async findById(id) {
    return prisma.visitor.findUnique({
      where: { visitorId: id },
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async findByName(name) {
    return prisma.visitor.findUnique({
      where: { visitorName: name },
    });
  },

  async create(data) {
    return prisma.visitor.create({
      data,
      include: { createdByEmployee: { select: EMPLOYEE_SELECT } },
    });
  },

  async update(id, data) {
    return prisma.visitor.update({
      where: { visitorId: id },
      data,
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },
};

export const VisitorService = {
  async getPaginated(skip, take) {
    const [items, total] = await Promise.all([
      VisitorRepository.findMany(skip, take),
      VisitorRepository.count(),
    ]);
    return { items, total };
  },

  async findById(id) {
    return VisitorRepository.findById(id);
  },

  async ensureNameNotDuplicate(name, excludeId = null) {
    const existing = await VisitorRepository.findByName(name);
    if (existing && existing.visitorId !== excludeId) {
      const { ConflictError } = await import("@/lib/shared/server");
      throw new ConflictError("visitorName", name);
    }
  },

  async create(data) {
    return VisitorRepository.create(data);
  },

  async update(id, data) {
    return VisitorRepository.update(id, data);
  },
};

export async function GetAllUseCase(page = 1, limit = 1000000) {
  const log = createLogger("GetAllVisitorUseCase");
  log.start({ page, limit });

  try {
    const skip = (page - 1) * limit;
    const { items, total } = await VisitorService.getPaginated(skip, limit);

    log.success({ total, returned: items.length });
    return { items, total };
  } catch (error) {
    console.error("[GetAllVisitorUseCase] Error:", error);
    throw error;
  }
}

export async function GetByIdUseCase(id) {
  const log = createLogger("GetVisitorByIdUseCase");
  log.start({ id });

  try {
    if (!id || typeof id !== "string") {
      throw new BadRequestError(`Invalid ${ENTITY_NAME} ID`);
    }

    const item = await VisitorService.findById(id);
    if (!item) {
      throw new NotFoundError(ENTITY_NAME);
    }

    log.success({ id, name: item.visitorName });
    return item;
  } catch (error) {
    console.error("[GetVisitorByIdUseCase] Error:", error);
    throw error;
  }
}

export async function CreateUseCase(data) {
  const log = createLogger("CreateVisitorUseCase");
  log.start({ name: data?.visitorName });

  try {
    const validated = validateOrThrow(createSchema, data);
    const normalizedName = normalizeString(validated.visitorName);

    await VisitorService.ensureNameNotDuplicate(normalizedName);

    const item = await VisitorService.create({
      ...validated,
      visitorName: normalizedName,
      visitorCreatedAt: getLocalNow(),
    });

    log.success({ id: item.visitorId, name: item.visitorName });
    return item;
  } catch (error) {
    console.error("[CreateVisitorUseCase] Error:", error);
    handlePrismaUniqueError(error, "visitorName", data?.visitorName);
    throw error;
  }
}

export async function UpdateUseCase(data) {
  const log = createLogger("UpdateVisitorUseCase");
  log.start({ id: data?.visitorId });

  try {
    const validated = validateOrThrow(updateSchema, data);
    const { visitorId, ...updateData } = validated;

    const existing = await VisitorService.findById(visitorId);
    if (!existing) {
      throw new NotFoundError(ENTITY_NAME);
    }

    const normalizedName = normalizeString(updateData.visitorName);
    const existingName = normalizeString(existing.visitorName);

    if (normalizedName !== existingName) {
      await VisitorService.ensureNameNotDuplicate(
        normalizedName,
        visitorId
      );
    }

    const item = await VisitorService.update(visitorId, {
      ...updateData,
      visitorName: normalizedName,
      visitorUpdatedAt: getLocalNow(),
    });

    log.success({ id: visitorId, name: item.visitorName });
    return item;
  } catch (error) {
    console.error("[UpdateVisitorUseCase] Error:", error);
    handlePrismaUniqueError(error, "visitorName", data?.visitorName);
    throw error;
  }
}

export function formatVisitorData(items) {
  return formatData(items, [], ["visitorCreatedAt", "visitorUpdatedAt"]);
}

const baseController = createBaseController({
  getAllUseCase: GetAllUseCase,
  getByIdUseCase: GetByIdUseCase,
  createUseCase: CreateUseCase,
  updateUseCase: (data) => UpdateUseCase({ ...data, visitorId: data.id }),
  formatData: formatVisitorData,
  entityKey: ENTITY_KEY,
  entitySingular: ENTITY_SINGULAR,
});

export const getAllVisitor = baseController.getAll;
export const getVisitorById = baseController.getById;
export const createVisitor = baseController.create;
export const updateVisitor = baseController.update;
