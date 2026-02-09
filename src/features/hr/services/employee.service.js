import prisma from "@/lib/prisma";
import { getLocalNow } from "@/lib/getLocalNow";
import { formatData } from "@/lib/zodSchema";
import { employeeCreateSchema, employeeUpdateSchema } from "@/features/hr/schemas";
import { PAGINATION } from "@/config/app.config";
import { isValidId } from "@/lib/validators";
import {
  NotFoundError,
  BadRequestError,
  validateOrThrow,
  normalizeString,
  createBaseController,
  handlePrismaUniqueError,
} from "@/lib/shared/server";
import { createLogger } from "@/lib/logger.node";

const ENTITY_NAME = "Employee";
const ENTITY_KEY = "employees";
const ENTITY_SINGULAR = "employee";

const DEFAULT_LIMIT = PAGINATION.DEFAULT_LIMIT;

const EMPLOYEE_SELECT = {
  employeeId: true,
  employeeFirstName: true,
  employeeLastName: true,
  employeeEmail: true,
};

const DEPARTMENT_SELECT = {
  departmentId: true,
  departmentName: true,
  departmentStatus: true,
};

const ROLE_SELECT = {
  roleId: true,
  roleName: true,
  roleStatus: true,
};

export const createSchema = employeeCreateSchema;
export const updateSchema = employeeUpdateSchema;

export const EmployeeRepository = {
  async findMany(skip = 0, take = 10) {
    return prisma.employee.findMany({
      skip,
      take,
      orderBy: { employeeCreatedAt: "asc" },
      include: {
        department: { select: DEPARTMENT_SELECT },
        employeeRoles: {
          include: {
            role: { select: ROLE_SELECT },
          },
        },
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
        department: { select: DEPARTMENT_SELECT },
        employeeRoles: {
          include: {
            role: { select: ROLE_SELECT },
          },
        },
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async findByEmail(email) {
    return prisma.employee.findUnique({
      where: { employeeEmail: email },
    });
  },

  async create(data) {
    return prisma.employee.create({
      data,
      include: {
        department: { select: DEPARTMENT_SELECT },
        employeeRoles: {
          include: {
            role: { select: ROLE_SELECT },
          },
        },
        createdByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async update(id, data) {
    return prisma.employee.update({
      where: { employeeId: id },
      data,
      include: {
        department: { select: DEPARTMENT_SELECT },
        employeeRoles: {
          include: {
            role: { select: ROLE_SELECT },
          },
        },
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

  async ensureEmailNotDuplicate(email, excludeId = null) {
    const existing = await EmployeeRepository.findByEmail(email);
    if (existing && existing.employeeId !== excludeId) {
      const { ConflictError } = await import("@/lib/shared/server");
      throw new ConflictError("employeeEmail", email);
    }
  },

  async create(data) {
    return EmployeeRepository.create(data);
  },

  async update(id, data) {
    return EmployeeRepository.update(id, data);
  },
};

export async function GetAllUseCase(page = 1, limit = DEFAULT_LIMIT) {
  const log = createLogger("GetAllEmployeeUseCase");
  log.start({ page, limit });

  try {
    const skip = (page - 1) * limit;
    const { items, total } = await EmployeeService.getPaginated(skip, limit);

    log.success({ total, returned: items.length });
    return { items, total };
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function GetByIdUseCase(id) {
  const log = createLogger("GetEmployeeByIdUseCase");
  log.start({ id });

  try {
    if (!id || !isValidId(id)) {
      throw new BadRequestError(`Invalid ${ENTITY_NAME} ID format`);
    }

    const item = await EmployeeService.findById(id);
    if (!item) {
      throw new NotFoundError(ENTITY_NAME);
    }

    log.success({ id, email: item.employeeEmail });
    return item;
  } catch (error) {
    log.error({ id, error: error.message });
    throw error;
  }
}

export async function CreateUseCase(data) {
  const log = createLogger("CreateEmployeeUseCase");
  log.start({ email: data?.employeeEmail });

  try {
    const validated = validateOrThrow(createSchema, data);

    const normalizedFirstName = normalizeString(validated.employeeFirstName);
    const normalizedLastName = normalizeString(validated.employeeLastName);
    const normalizedEmail = validated.employeeEmail;

    await EmployeeService.ensureEmailNotDuplicate(normalizedEmail);

    const item = await EmployeeService.create({
      ...validated,
      employeeFirstName: normalizedFirstName,
      employeeLastName: normalizedLastName,
      employeeEmail: normalizedEmail,
      employeeCreatedAt: getLocalNow(),
    });

    log.success({ id: item.employeeId, email: item.employeeEmail });
    return item;
  } catch (error) {
    log.error({ email: data?.employeeEmail, error: error.message });
    handlePrismaUniqueError(error, "employeeEmail", data?.employeeEmail);
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

    const normalizedFirstName = normalizeString(updateData.employeeFirstName);
    const normalizedLastName = normalizeString(updateData.employeeLastName);
    const normalizedEmail = updateData.employeeEmail;

    if (normalizedEmail !== existing.employeeEmail.toLowerCase()) {
      await EmployeeService.ensureEmailNotDuplicate(
        normalizedEmail,
        employeeId,
      );
    }

    const item = await EmployeeService.update(employeeId, {
      ...updateData,
      employeeFirstName: normalizedFirstName,
      employeeLastName: normalizedLastName,
      employeeEmail: normalizedEmail,
      employeeUpdatedAt: getLocalNow(),
    });

    log.success({ id: employeeId, email: item.employeeEmail });
    return item;
  } catch (error) {
    log.error({ id: data?.employeeId, error: error.message });
    handlePrismaUniqueError(error, "employeeEmail", data?.employeeEmail);
    throw error;
  }
}

export function formatEmployeeData(items) {
  return formatData(items, [], ["employeeCreatedAt", "employeeUpdatedAt"]);
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
