import prisma from "@/lib/prisma";
import { PAGINATION } from "@/config/app.config";
import { getLocalNow } from "@/lib/getLocalNow";
import { z } from "zod";
import { preprocessString, preprocessDate, formatData } from "@/lib/zodSchema";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
  validateOrThrow,
  normalizeString,
  createLogger,
  handlePrismaUniqueError,
  createBaseController,
} from "@/lib/shared/server";

const ENTITY_NAME = "SalesMemo";
const ENTITY_KEY = "memos";
const ENTITY_SINGULAR = "memo";

const EMPLOYEE_SELECT = {
  employeeId: true,
  employeeFirstName: true,
  employeeLastName: true,
};

// Status constants
export const MEMO_STATUS = {
  DRAFT: "DRAFT",
  PENDING_SALES_MANAGER: "PENDING_SALES_MANAGER",
  PENDING_CEO: "PENDING_CEO",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

// Status flow validation
const STATUS_FLOW = {
  [MEMO_STATUS.DRAFT]: [MEMO_STATUS.PENDING_SALES_MANAGER],
  [MEMO_STATUS.PENDING_SALES_MANAGER]: [MEMO_STATUS.PENDING_CEO, MEMO_STATUS.REJECTED],
  [MEMO_STATUS.PENDING_CEO]: [MEMO_STATUS.APPROVED, MEMO_STATUS.REJECTED],
  [MEMO_STATUS.APPROVED]: [],
  [MEMO_STATUS.REJECTED]: [MEMO_STATUS.DRAFT],
};

// Required permissions for each approval step
const APPROVAL_PERMISSIONS = {
  [MEMO_STATUS.PENDING_SALES_MANAGER]: "sales.memo.approve.salesmanager",
  [MEMO_STATUS.PENDING_CEO]: "sales.memo.approve.ceo",
};

export const createSchema = z.object({
  documentNo: preprocessString("Please provide documentNo"),
  to: preprocessString("Please provide to"),
  copy: z.string().optional().nullable(),
  subject: preprocessString("Please provide subject"),
  date: preprocessDate("Please provide date"),
  content: preprocessString("Please provide content"),
  requesterName: preprocessString("Please provide requesterName"),
  requesterDate: preprocessDate("Please provide requesterDate").optional().nullable(),
  status: z.enum(["DRAFT", "PENDING_SALES_MANAGER"]).optional().default("DRAFT"),
  createdBy: preprocessString("Please provide the creator ID"),
});

export const updateSchema = z.object({
  memoId: preprocessString("Please provide the memo ID"),
  documentNo: preprocessString("Please provide documentNo"),
  to: preprocessString("Please provide to"),
  copy: z.string().optional().nullable(),
  subject: preprocessString("Please provide subject"),
  date: preprocessDate("Please provide date"),
  content: preprocessString("Please provide content"),
  requesterName: preprocessString("Please provide requesterName"),
  requesterDate: preprocessDate("Please provide requesterDate").optional().nullable(),
  status: z.enum(["DRAFT", "PENDING_SALES_MANAGER"]).optional(),
  updatedBy: preprocessString("Please provide the updater ID"),
});

export const MemoRepository = {
  async findMany(skip = 0, take = 10) {
    return prisma.salesMemo.findMany({
      skip,
      take,
      orderBy: { memoCreatedAt: "desc" },
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
        salesManagerEmployee: { select: EMPLOYEE_SELECT },
        ceoEmployee: { select: EMPLOYEE_SELECT },
        rejectedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async count() {
    return prisma.salesMemo.count();
  },

  async findById(id) {
    return prisma.salesMemo.findUnique({
      where: { memoId: id },
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
        salesManagerEmployee: { select: EMPLOYEE_SELECT },
        ceoEmployee: { select: EMPLOYEE_SELECT },
        rejectedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async findByDocumentNo(documentNo) {
    return prisma.salesMemo.findUnique({
      where: { memoDocumentNo: documentNo },
    });
  },

  async create(data) {
    return prisma.salesMemo.create({
      data,
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        salesManagerEmployee: { select: EMPLOYEE_SELECT },
        ceoEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async update(id, data) {
    return prisma.salesMemo.update({
      where: { memoId: id },
      data,
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
        salesManagerEmployee: { select: EMPLOYEE_SELECT },
        ceoEmployee: { select: EMPLOYEE_SELECT },
        rejectedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async delete(id) {
    return prisma.salesMemo.delete({
      where: { memoId: id },
    });
  },

  async findLatestDocumentNoForMonth(monthPrefix) {
    const latest = await prisma.salesMemo.findFirst({
      where: {
        memoDocumentNo: {
          startsWith: `ME-${monthPrefix}`,
        },
      },
      orderBy: {
        memoDocumentNo: "desc",
      },
    });
    return latest?.memoDocumentNo || null;
  },
};

export const MemoService = {
  async getPaginated(skip, take) {
    const [items, total] = await Promise.all([
      MemoRepository.findMany(skip, take),
      MemoRepository.count(),
    ]);
    return { items, total };
  },

  async findById(id) {
    return MemoRepository.findById(id);
  },

  async ensureDocumentNoNotDuplicate(documentNo, excludeId = null) {
    const existing = await MemoRepository.findByDocumentNo(documentNo);
    if (existing && existing.memoId !== excludeId) {
      throw new ConflictError("documentNo", documentNo);
    }
  },

  async create(data) {
    return MemoRepository.create(data);
  },

  async update(id, data) {
    return MemoRepository.update(id, data);
  },

  async delete(id) {
    return MemoRepository.delete(id);
  },

  async getNextDocumentNo() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const monthPrefix = `${year}${month}`;

    const latest = await MemoRepository.findLatestDocumentNoForMonth(monthPrefix);
    
    if (!latest) {
      return `ME-${monthPrefix}-0001`;
    }

    const match = latest.match(/ME-\d{4}-(\d+)/);
    if (!match) {
      return `ME-${monthPrefix}-0001`;
    }

    const nextNumber = parseInt(match[1], 10) + 1;
    return `ME-${monthPrefix}-${nextNumber.toString().padStart(4, "0")}`;
  },
};

export async function GetAllUseCase(page = 1, limit = PAGINATION.DEFAULT_LIMIT) {
  const log = createLogger("GetAllMemoUseCase");
  log.start({ page, limit });

  try {
    const skip = (page - 1) * limit;
    const { items, total } = await MemoService.getPaginated(skip, limit);

    log.success({ total, returned: items.length });
    return { items, total };
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function GetByIdUseCase(id) {
  const log = createLogger("GetMemoByIdUseCase");
  log.start({ id });

  try {
    if (!id || typeof id !== "string") {
      throw new BadRequestError(`Invalid ${ENTITY_NAME} ID`);
    }

    const item = await MemoService.findById(id);
    if (!item) {
      throw new NotFoundError(ENTITY_NAME);
    }

    log.success({ id, documentNo: item.memoDocumentNo });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function CreateUseCase(data) {
  const log = createLogger("CreateMemoUseCase");
  log.start({ documentNo: data?.documentNo });

  try {
    const validated = validateOrThrow(createSchema, data);

    await MemoService.ensureDocumentNoNotDuplicate(validated.documentNo);

    const item = await MemoService.create({
      memoDocumentNo: validated.documentNo,
      memoTo: validated.to,
      memoCopy: validated.copy,
      memoSubject: validated.subject,
      memoDate: validated.date,
      memoContent: validated.content,
      memoRequesterName: validated.requesterName,
      memoRequesterDate: validated.requesterDate,
      memoStatus: validated.status,
      memoCreatedBy: validated.createdBy,
      memoCreatedAt: getLocalNow(),
    });

    log.success({ id: item.memoId, documentNo: item.memoDocumentNo });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    handlePrismaUniqueError(error, "documentNo", data?.documentNo);
    throw error;
  }
}

export async function UpdateUseCase(data) {
  const log = createLogger("UpdateMemoUseCase");
  log.start({ id: data?.memoId });

  try {
    const validated = validateOrThrow(updateSchema, data);
    const { memoId, ...updateData } = validated;

    const existing = await MemoService.findById(memoId);
    if (!existing) {
      throw new NotFoundError(ENTITY_NAME);
    }

    if (updateData.documentNo !== existing.memoDocumentNo) {
      await MemoService.ensureDocumentNoNotDuplicate(
        updateData.documentNo,
        memoId
      );
    }

    // Only allow update if status is DRAFT or REJECTED
    if (![MEMO_STATUS.DRAFT, MEMO_STATUS.REJECTED].includes(existing.memoStatus)) {
      throw new BadRequestError(`Cannot update memo with status: ${existing.memoStatus}`);
    }

    const item = await MemoService.update(memoId, {
      memoDocumentNo: updateData.documentNo,
      memoTo: updateData.to,
      memoCopy: updateData.copy,
      memoSubject: updateData.subject,
      memoDate: updateData.date,
      memoContent: updateData.content,
      memoRequesterName: updateData.requesterName,
      memoRequesterDate: updateData.requesterDate,
      memoStatus: updateData.status || existing.memoStatus,
      memoUpdatedBy: updateData.updatedBy,
      memoUpdatedAt: getLocalNow(),
      // Clear approval data when rejected memo is being resubmitted
      ...(updateData.status === MEMO_STATUS.PENDING_SALES_MANAGER && {
        memoSalesManagerId: null,
        memoSalesManagerName: null,
        memoSalesManagerDate: null,
        memoCeoId: null,
        memoCeoName: null,
        memoCeoDate: null,
        memoRejectedById: null,
        memoRejectedByName: null,
        memoRejectedAt: null,
        memoRejectReason: null,
      }),
    });

    log.success({ id: memoId, documentNo: item.memoDocumentNo });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    handlePrismaUniqueError(error, "documentNo", data?.documentNo);
    throw error;
  }
}

export async function DeleteUseCase(id, deletedBy) {
  const log = createLogger("DeleteMemoUseCase");
  log.start({ id });

  try {
    if (!id || typeof id !== "string") {
      throw new BadRequestError(`Invalid ${ENTITY_NAME} ID`);
    }

    const existing = await MemoService.findById(id);
    if (!existing) {
      throw new NotFoundError(ENTITY_NAME);
    }

    await MemoService.delete(id);

    log.success({ id });
    return { success: true };
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function GetNextDocumentNoUseCase() {
  const log = createLogger("GetNextDocumentNoUseCase");
  log.start();

  try {
    const nextDocumentNo = await MemoService.getNextDocumentNo();
    log.success({ nextDocumentNo });
    return { documentNo: nextDocumentNo };
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

// Approval/Reject Schemas
export const approveSchema = z.object({
  memoId: preprocessString("Please provide the memo ID"),
  employeeId: preprocessString("Please provide the employee ID"),
  employeeName: preprocessString("Please provide the employee name"),
});

export const rejectSchema = z.object({
  memoId: preprocessString("Please provide the memo ID"),
  employeeId: preprocessString("Please provide the employee ID"),
  employeeName: preprocessString("Please provide the employee name"),
  reason: preprocessString("Please provide the rejection reason"),
});

/**
 * Validate if user can approve based on current status
 */
function validateApprovalPermission(currentStatus, userPermissions) {
  const requiredPermission = APPROVAL_PERMISSIONS[currentStatus];
  
  if (!requiredPermission) {
    throw new BadRequestError(`Invalid status for approval: ${currentStatus}`);
  }
  
  if (!userPermissions.includes(requiredPermission) && !userPermissions.includes("superadmin")) {
    throw new BadRequestError(`You don't have permission to approve at this stage`);
  }
  
  return requiredPermission;
}

/**
 * Get the next status after approval
 */
function getNextStatus(currentStatus) {
  const flow = STATUS_FLOW[currentStatus];
  if (!flow || flow.length === 0) {
    throw new BadRequestError(`Cannot approve memo with status: ${currentStatus}`);
  }
  // Return the first valid next status (not rejected)
  const nextStatus = flow.find(s => s !== MEMO_STATUS.REJECTED);
  if (!nextStatus) {
    throw new BadRequestError(`No valid next status for: ${currentStatus}`);
  }
  return nextStatus;
}

export async function ApproveUseCase(data, userPermissions) {
  const log = createLogger("ApproveMemoUseCase");
  log.start({ memoId: data?.memoId });

  try {
    const validated = validateOrThrow(approveSchema, data);
    const { memoId, employeeId, employeeName } = validated;

    const existing = await MemoService.findById(memoId);
    if (!existing) {
      throw new NotFoundError(ENTITY_NAME);
    }

    // Validate permission based on current status
    validateApprovalPermission(existing.memoStatus, userPermissions);

    // Get next status
    const nextStatus = getNextStatus(existing.memoStatus);

    // Prepare update data based on current status
    const updateData = {
      memoStatus: nextStatus,
    };

    if (existing.memoStatus === MEMO_STATUS.PENDING_SALES_MANAGER) {
      updateData.memoSalesManagerId = employeeId;
      updateData.memoSalesManagerName = employeeName;
      updateData.memoSalesManagerDate = getLocalNow();
    } else if (existing.memoStatus === MEMO_STATUS.PENDING_CEO) {
      updateData.memoCeoId = employeeId;
      updateData.memoCeoName = employeeName;
      updateData.memoCeoDate = getLocalNow();
    }

    const item = await MemoService.update(memoId, updateData);

    log.success({ id: memoId, status: nextStatus });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function RejectUseCase(data, userPermissions) {
  const log = createLogger("RejectMemoUseCase");
  log.start({ memoId: data?.memoId });

  try {
    const validated = validateOrThrow(rejectSchema, data);
    const { memoId, employeeId, employeeName, reason } = validated;

    const existing = await MemoService.findById(memoId);
    if (!existing) {
      throw new NotFoundError(ENTITY_NAME);
    }

    // Can only reject if status is PENDING_SALES_MANAGER or PENDING_CEO
    if (![MEMO_STATUS.PENDING_SALES_MANAGER, MEMO_STATUS.PENDING_CEO].includes(existing.memoStatus)) {
      throw new BadRequestError(`Cannot reject memo with status: ${existing.memoStatus}`);
    }

    // Validate permission
    validateApprovalPermission(existing.memoStatus, userPermissions);

    const item = await MemoService.update(memoId, {
      memoStatus: MEMO_STATUS.REJECTED,
      memoRejectedById: employeeId,
      memoRejectedByName: employeeName,
      memoRejectedAt: getLocalNow(),
      memoRejectReason: reason,
    });

    log.success({ id: memoId, status: MEMO_STATUS.REJECTED });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export function formatMemoData(items) {
  return formatData(items, [], ["memoCreatedAt", "memoUpdatedAt"]);
}

const baseController = createBaseController({
  getAllUseCase: GetAllUseCase,
  getByIdUseCase: GetByIdUseCase,
  createUseCase: CreateUseCase,
  updateUseCase: (data) => UpdateUseCase({ ...data, memoId: data.id }),
  formatData: formatMemoData,
  entityKey: ENTITY_KEY,
  entitySingular: ENTITY_SINGULAR,
});

export const getAllMemo = baseController.getAll;
export const getMemoById = baseController.getById;
export const createMemo = baseController.create;
export const updateMemo = baseController.update;
