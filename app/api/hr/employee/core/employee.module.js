/**
 * Employee Module - ตัวอย่างการ reuse Shared Utilities
 * ดู pattern เหมือน Permission Module แต่ต่าง entity
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import { getLocalNow } from "@/lib/getLocalNow";
import { preprocessString, preprocessEnum, formatData } from "@/lib/zodSchema";
import {
  NotFoundError,
  BadRequestError,
  validateOrThrow,
  normalizeString,
  createBaseController,
  createLogger,
  handlePrismaUniqueError,
} from "@/lib/shared/server";  // ⚠️ ใช้ /server สำหรับ server-side

// ============================================================
// Constants
// ============================================================

const ENTITY_NAME = "Employee";

// ============================================================
// Schemas
// ============================================================

export const createSchema = z.object({
  employeeFirstName: preprocessString("Please provide first name"),
  employeeLastName: preprocessString("Please provide last name"),
  employeeEmail: preprocessString("Please provide email").email("Invalid email"),
  employeeCreatedBy: preprocessString("Please provide the creator ID"),
});

export const updateSchema = z.object({
  employeeId: preprocessString("Please provide the employee ID"),
  employeeFirstName: preprocessString("Please provide first name"),
  employeeLastName: preprocessString("Please provide last name"),
  employeeEmail: preprocessString("Please provide email").email("Invalid email"),
  employeeStatus: preprocessEnum(["Active", "Inactive"], "Please provide status"),
  employeeUpdatedBy: preprocessString("Please provide the updater ID"),
});

// ============================================================
// Repository
// ============================================================

export const EmployeeRepository = {
  async findMany(skip = 0, take = 10) {
    return prisma.employee.findMany({
      skip,
      take,
      orderBy: { employeeCreatedAt: "asc" },
    });
  },

  async count() {
    return prisma.employee.count();
  },

  async findById(id) {
    return prisma.employee.findUnique({
      where: { employeeId: id },
    });
  },

  async findByEmail(email) {
    return prisma.employee.findUnique({
      where: { employeeEmail: email },
    });
  },

  async create(data) {
    return prisma.employee.create({ data });
  },

  async update(id, data) {
    return prisma.employee.update({
      where: { employeeId: id },
      data,
    });
  },
};

// ============================================================
// Service
// ============================================================

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

// ============================================================
// Use Cases
// ============================================================

export async function GetAllUseCase(page = 1, limit = 1000000) {
  const log = createLogger("GetAllEmployeeUseCase");
  log.start({ page, limit });

  const skip = (page - 1) * limit;
  const { items, total } = await EmployeeService.getPaginated(skip, limit);

  log.success({ total, returned: items.length });
  return { items, total };
}

export async function GetByIdUseCase(id) {
  const log = createLogger("GetEmployeeByIdUseCase");
  log.start({ id });

  if (!id || typeof id !== "string") {
    throw new BadRequestError(`Invalid ${ENTITY_NAME} ID`);
  }

  const item = await EmployeeService.findById(id);
  if (!item) {
    throw new NotFoundError(ENTITY_NAME);
  }

  log.success({ id, email: item.employeeEmail });
  return item;
}

export async function CreateUseCase(data) {
  const log = createLogger("CreateEmployeeUseCase");
  log.start({ email: data?.employeeEmail });

  const validated = validateOrThrow(createSchema, data);
  const normalizedEmail = normalizeString(validated.employeeEmail);

  await EmployeeService.ensureEmailNotDuplicate(normalizedEmail);

  try {
    const item = await EmployeeService.create({
      ...validated,
      employeeEmail: normalizedEmail,
      employeeCreatedAt: getLocalNow(),
    });

    log.success({ id: item.employeeId, email: item.employeeEmail });
    return item;
  } catch (error) {
    handlePrismaUniqueError(error, "employeeEmail", normalizedEmail);
  }
}

export async function UpdateUseCase(data) {
  const log = createLogger("UpdateEmployeeUseCase");
  log.start({ id: data?.employeeId });

  const validated = validateOrThrow(updateSchema, data);
  const { employeeId, ...updateData } = validated;

  const existing = await EmployeeService.findById(employeeId);
  if (!existing) {
    throw new NotFoundError(ENTITY_NAME);
  }

  const normalizedEmail = normalizeString(updateData.employeeEmail);
  const existingEmail = normalizeString(existing.employeeEmail);

  if (normalizedEmail !== existingEmail) {
    await EmployeeService.ensureEmailNotDuplicate(normalizedEmail, employeeId);
  }

  try {
    const item = await EmployeeService.update(employeeId, {
      ...updateData,
      employeeEmail: normalizedEmail,
      employeeUpdatedAt: getLocalNow(),
    });

    log.success({ id: employeeId, email: item.employeeEmail });
    return item;
  } catch (error) {
    handlePrismaUniqueError(error, "employeeEmail", normalizedEmail);
  }
}

// ============================================================
// Formatter
// ============================================================

export function formatEmployeeData(items) {
  return formatData(items, ["employeeCreatedAt", "employeeUpdatedAt"], []);
}

// ============================================================
// Controller
// ============================================================

const baseController = createBaseController({
  getAllUseCase: GetAllUseCase,
  getByIdUseCase: GetByIdUseCase,
  createUseCase: CreateUseCase,
  updateUseCase: (data) => UpdateUseCase({ ...data, employeeId: data.id }),
  formatData: formatEmployeeData,
});

export const getAllEmployee = baseController.getAll;
export const getEmployeeById = baseController.getById;
export const createEmployee = baseController.create;
export const updateEmployee = baseController.update;