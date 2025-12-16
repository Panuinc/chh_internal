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

const ENTITY_NAME = "Employee";
const ENTITY_KEY = "employees";
const ENTITY_SINGULAR = "employee";

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
  employeeFirstName: preprocessString("Please provide employeeFirstName"),
  employeeCreatedBy: preprocessString("Please provide the creator ID"),
});

export const updateSchema = z.object({
  employeeId: preprocessString("Please provide the employee ID"),
  employeeFirstName: preprocessString("Please provide employeeFirstName"),
  employeeStatus: preprocessEnum(
    ["Active", "Inactive"],
    "Please provide employeeStatus"
  ),
  employeeUpdatedBy: preprocessString("Please provide the updater ID"),
});

export const EmployeeRepository = {
  async findMany(skip = 0, take = 10) {
    return prisma.employee.findMany({
      skip,
      take,
      orderBy: { employeeCreatedAt: "asc" },
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async count() {
    return prisma.employee.count();
  },

  async findById(id) {
    return prisma.employee.findUnique({
      where: { employeeId: id },
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async findByName(name) {
    return prisma.employee.findUnique({
      where: { employeeFirstName: name },
    });
  },

  async create(data) {
    return prisma.employee.create({
      data,
      include: { createdByEmployee: { select: EMPLOYEE_SELECT } },
    });
  },

  async update(id, data) {
    return prisma.employee.update({
      where: { employeeId: id },
      data,
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },
};

export const EmployeeService = {
  async getPaginated(skip, take) {
    const [items, total] = await Promise.all([
      EmployeeRepository.findMany(skip, take),
      EmployeeRepository.count(),
    ]);
    return { items, total };
  },

  async findById(id) {
    return EmployeeRepository.findById(id);
  },

  async ensureNameNotDuplicate(name, excludeId = null) {
    const existing = await EmployeeRepository.findByName(name);
    if (existing && existing.employeeId !== excludeId) {
      const { ConflictError } = await import("@/lib/shared/server");
      throw new ConflictError("employeeFirstName", name);
    }
  },

  async create(data) {
    return EmployeeRepository.create(data);
  },

  async update(id, data) {
    return EmployeeRepository.update(id, data);
  },
};

export async function GetAllUseCase(page = 1, limit = 1000000) {
  const log = createLogger("GetAllEmployeeUseCase");
  log.start({ page, limit });

  try {
    const skip = (page - 1) * limit;
    const { items, total } = await EmployeeService.getPaginated(skip, limit);

    log.success({ total, returned: items.length });
    return { items, total };
  } catch (error) {
    console.error("[GetAllEmployeeUseCase] Error:", error);
    throw error;
  }
}

export async function GetByIdUseCase(id) {
  const log = createLogger("GetEmployeeByIdUseCase");
  log.start({ id });

  try {
    if (!id || typeof id !== "string") {
      throw new BadRequestError(`Invalid ${ENTITY_NAME} ID`);
    }

    const item = await EmployeeService.findById(id);
    if (!item) {
      throw new NotFoundError(ENTITY_NAME);
    }

    log.success({ id, name: item.employeeFirstName });
    return item;
  } catch (error) {
    console.error("[GetEmployeeByIdUseCase] Error:", error);
    throw error;
  }
}

export async function CreateUseCase(data) {
  const log = createLogger("CreateEmployeeUseCase");
  log.start({ name: data?.employeeFirstName });

  try {
    const validated = validateOrThrow(createSchema, data);
    const normalizedName = normalizeString(validated.employeeFirstName);

    await EmployeeService.ensureNameNotDuplicate(normalizedName);

    const item = await EmployeeService.create({
      ...validated,
      employeeFirstName: normalizedName,
      employeeCreatedAt: getLocalNow(),
    });

    log.success({ id: item.employeeId, name: item.employeeFirstName });
    return item;
  } catch (error) {
    console.error("[CreateEmployeeUseCase] Error:", error);
    handlePrismaUniqueError(error, "employeeFirstName", data?.employeeFirstName);
    throw error;
  }
}

export async function UpdateUseCase(data) {
  const log = createLogger("UpdateEmployeeUseCase");
  log.start({ id: data?.employeeId });

  try {
    const validated = validateOrThrow(updateSchema, data);
    const { employeeId, ...updateData } = validated;

    const existing = await EmployeeService.findById(employeeId);
    if (!existing) {
      throw new NotFoundError(ENTITY_NAME);
    }

    const normalizedName = normalizeString(updateData.employeeFirstName);
    const existingName = normalizeString(existing.employeeFirstName);

    if (normalizedName !== existingName) {
      await EmployeeService.ensureNameNotDuplicate(
        normalizedName,
        employeeId
      );
    }

    const item = await EmployeeService.update(employeeId, {
      ...updateData,
      employeeFirstName: normalizedName,
      employeeUpdatedAt: getLocalNow(),
    });

    log.success({ id: employeeId, name: item.employeeFirstName });
    return item;
  } catch (error) {
    console.error("[UpdateEmployeeUseCase] Error:", error);
    handlePrismaUniqueError(error, "employeeFirstName", data?.employeeFirstName);
    throw error;
  }
}

export function formatEmployeeData(items) {
  return formatData(items, ["employeeCreatedAt", "employeeUpdatedAt"], []);
}

const baseController = createBaseController({
  getAllUseCase: GetAllUseCase,
  getByIdUseCase: GetByIdUseCase,
  createUseCase: CreateUseCase,
  updateUseCase: (data) => UpdateUseCase({ ...data, employeeId: data.id }),
  formatData: formatEmployeeData,
  entityKey: ENTITY_KEY,
  entitySingular: ENTITY_SINGULAR,
});

export const getAllEmployee = baseController.getAll;
export const getEmployeeById = baseController.getById;
export const createEmployee = baseController.create;
export const updateEmployee = baseController.update;