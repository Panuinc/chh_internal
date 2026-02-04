import prisma from "@/lib/prisma";
import { getLocalNow } from "@/lib/getLocalNow";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { preprocessString, preprocessEnum, formatData } from "@/lib/zodSchema";
import {
  NotFoundError,
  BadRequestError,
  validateOrThrow,
  createBaseController,
  createLogger,
  handlePrismaUniqueError,
} from "@/lib/shared/server";

const ENTITY_NAME = "Account";
const ENTITY_KEY = "accounts";
const ENTITY_SINGULAR = "account";

const SALT_ROUNDS = 10;

const EMPLOYEE_SELECT = {
  employeeId: true,
  employeeFirstName: true,
  employeeLastName: true,
  employeeEmail: true,
};

export const createSchema = z.object({
  accountEmployeeId: preprocessString("Please provide accountEmployeeId"),
  accountUsername: preprocessString("Please provide accountUsername"),
  accountPassword: preprocessString("Please provide accountPassword"),
  accountPinNumber: z.string().optional().nullable(),
  accountCreatedBy: preprocessString("Please provide the creator ID"),
});

export const updateSchema = z.object({
  accountId: preprocessString("Please provide the account ID"),
  accountUsername: preprocessString("Please provide accountUsername"),
  accountPassword: z.string().optional().nullable(),
  accountPinNumber: z.string().optional().nullable(),
  accountStatus: preprocessEnum(
    ["Active", "Inactive"],
    "Please provide accountStatus"
  ),
  accountUpdatedBy: preprocessString("Please provide the updater ID"),
});

async function hashPassword(password) {
  if (!password) return null;
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function hashPinNumber(pin) {
  if (!pin) return null;
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;
  return bcrypt.compare(password, hashedPassword);
}

export async function verifyPinNumber(pin, hashedPin) {
  if (!pin || !hashedPin) return false;
  return bcrypt.compare(pin, hashedPin);
}

export const AccountRepository = {
  async findMany(skip = 0, take = 10) {
    return prisma.account.findMany({
      skip,
      take,
      orderBy: { accountCreatedAt: "asc" },
      include: {
        accountEmployee: { select: EMPLOYEE_SELECT },
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async count() {
    return prisma.account.count();
  },

  async findById(id) {
    return prisma.account.findUnique({
      where: { accountId: id },
      include: {
        accountEmployee: { select: EMPLOYEE_SELECT },
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async findByEmployeeId(employeeId) {
    return prisma.account.findUnique({
      where: { accountEmployeeId: employeeId },
    });
  },

  async findByUsername(username) {
    return prisma.account.findFirst({
      where: { accountUsername: username },
    });
  },

  async create(data) {
    return prisma.account.create({
      data,
      include: {
        accountEmployee: { select: EMPLOYEE_SELECT },
        createdByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async update(id, data) {
    return prisma.account.update({
      where: { accountId: id },
      data,
      include: {
        accountEmployee: { select: EMPLOYEE_SELECT },
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },
};

export const AccountService = {
  async getPaginated(skip, take) {
    const [items, total] = await Promise.all([
      AccountRepository.findMany(skip, take),
      AccountRepository.count(),
    ]);
    return { items, total };
  },

  async findById(id) {
    return AccountRepository.findById(id);
  },

  async findByUsername(username) {
    return AccountRepository.findByUsername(username);
  },

  async ensureEmployeeNotHaveAccount(employeeId, excludeId = null) {
    const existing = await AccountRepository.findByEmployeeId(employeeId);
    if (existing && existing.accountId !== excludeId) {
      const { ConflictError } = await import("@/lib/shared/server");
      throw new ConflictError("accountEmployeeId", employeeId);
    }
  },

  async ensureUsernameNotDuplicate(username, excludeId = null) {
    const existing = await AccountRepository.findByUsername(username);
    if (existing && existing.accountId !== excludeId) {
      const { ConflictError } = await import("@/lib/shared/server");
      throw new ConflictError("accountUsername", username);
    }
  },

  async create(data) {
    return AccountRepository.create(data);
  },

  async update(id, data) {
    return AccountRepository.update(id, data);
  },
};

export async function GetAllUseCase(page = 1, limit = 1000000) {
  const log = createLogger("GetAllAccountUseCase");
  log.start({ page, limit });

  try {
    const skip = (page - 1) * limit;
    const { items, total } = await AccountService.getPaginated(skip, limit);

    log.success({ total, returned: items.length });
    return { items, total };
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function GetByIdUseCase(id) {
  const log = createLogger("GetAccountByIdUseCase");
  log.start({ id });

  try {
    if (!id || typeof id !== "string") {
      throw new BadRequestError(`Invalid ${ENTITY_NAME} ID`);
    }

    const item = await AccountService.findById(id);
    if (!item) {
      throw new NotFoundError(ENTITY_NAME);
    }

    log.success({ id, username: item.accountUsername });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function CreateUseCase(data) {
  const log = createLogger("CreateAccountUseCase");
  log.start({ employeeId: data?.accountEmployeeId });

  try {
    const validated = validateOrThrow(createSchema, data);

    await AccountService.ensureEmployeeNotHaveAccount(
      validated.accountEmployeeId
    );
    await AccountService.ensureUsernameNotDuplicate(validated.accountUsername);

    const hashedPassword = await hashPassword(validated.accountPassword);
    const hashedPin = await hashPinNumber(validated.accountPinNumber);

    const item = await AccountService.create({
      ...validated,
      accountPassword: hashedPassword,
      accountPinNumber: hashedPin,
      accountCreatedAt: getLocalNow(),
    });

    log.success({ id: item.accountId, username: item.accountUsername });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    handlePrismaUniqueError(
      error,
      "accountEmployeeId",
      data?.accountEmployeeId
    );
    handlePrismaUniqueError(error, "accountUsername", data?.accountUsername);
    throw error;
  }
}

export async function UpdateUseCase(data) {
  const log = createLogger("UpdateAccountUseCase");
  log.start({ id: data?.accountId });

  try {
    const validated = validateOrThrow(updateSchema, data);
    const { accountId, ...updateData } = validated;

    const existing = await AccountService.findById(accountId);
    if (!existing) {
      throw new NotFoundError(ENTITY_NAME);
    }

    if (updateData.accountUsername !== existing.accountUsername) {
      await AccountService.ensureUsernameNotDuplicate(
        updateData.accountUsername,
        accountId
      );
    }

    const dataToUpdate = {
      accountUsername: updateData.accountUsername,
      accountStatus: updateData.accountStatus,
      accountUpdatedBy: updateData.accountUpdatedBy,
      accountUpdatedAt: getLocalNow(),
    };

    if (
      updateData.accountPassword &&
      updateData.accountPassword.trim() !== ""
    ) {
      dataToUpdate.accountPassword = await hashPassword(
        updateData.accountPassword
      );
    }

    if (updateData.accountPinNumber !== undefined) {
      if (
        updateData.accountPinNumber &&
        updateData.accountPinNumber.trim() !== ""
      ) {
        dataToUpdate.accountPinNumber = await hashPinNumber(
          updateData.accountPinNumber
        );
      } else {
        dataToUpdate.accountPinNumber = null;
      }
    }

    const item = await AccountService.update(accountId, dataToUpdate);

    log.success({ id: accountId, username: item.accountUsername });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    handlePrismaUniqueError(error, "accountUsername", data?.accountUsername);
    throw error;
  }
}

export function formatAccountData(items) {
  return formatData(items, [], ["accountCreatedAt", "accountUpdatedAt"]);
}

const baseController = createBaseController({
  getAllUseCase: GetAllUseCase,
  getByIdUseCase: GetByIdUseCase,
  createUseCase: CreateUseCase,
  updateUseCase: (data) => UpdateUseCase({ ...data, accountId: data.id }),
  formatData: formatAccountData,
  entityKey: ENTITY_KEY,
  entitySingular: ENTITY_SINGULAR,
});

export const getAllAccount = baseController.getAll;
export const getAccountById = baseController.getById;
export const createAccount = baseController.create;
export const updateAccount = baseController.update;
