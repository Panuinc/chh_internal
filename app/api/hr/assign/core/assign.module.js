import prisma from "@/lib/prisma";
import { getLocalNow } from "@/lib/getLocalNow";
import { z } from "zod";
import { preprocessString, formatData } from "@/lib/zodSchema";
import {
  NotFoundError,
  BadRequestError,
  validateOrThrow,
  createLogger,
} from "@/lib/shared/server";
import { NextResponse } from "next/server";

const ENTITY_NAME = "Assign";

const EMPLOYEE_SELECT = {
  employeeId: true,
  employeeFirstName: true,
  employeeLastName: true,
  employeeEmail: true,
  employeeStatus: true,
};

const PERMISSION_SELECT = {
  permissionId: true,
  permissionName: true,
  permissionStatus: true,
};

export const bulkAssignSchema = z.object({
  employeeId: preprocessString("Please provide employeeId"),
  permissionIds: z.array(z.string()).min(0),
  assignCreatedBy: preprocessString("Please provide the creator ID"),
});

export const AssignRepository = {
  async findByEmployee(employeeId) {
    return prisma.assign.findMany({
      where: { assignEmployeeId: employeeId },
      include: {
        permission: { select: PERMISSION_SELECT },
        employee: { select: EMPLOYEE_SELECT },
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
      orderBy: { assignCreatedAt: "asc" },
    });
  },

  async findByEmployeeAndPermission(employeeId, permissionId) {
    return prisma.assign.findFirst({
      where: {
        assignEmployeeId: employeeId,
        assignPermissionId: permissionId,
      },
    });
  },

  async create(data) {
    return prisma.assign.create({
      data,
      include: {
        permission: { select: PERMISSION_SELECT },
        employee: { select: EMPLOYEE_SELECT },
        createdByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async createMany(dataArray) {
    return prisma.assign.createMany({
      data: dataArray,
      skipDuplicates: true,
    });
  },

  async delete(assignId) {
    return prisma.assign.delete({
      where: { assignId },
    });
  },

  async deleteByEmployeeAndPermissions(employeeId, permissionIds) {
    return prisma.assign.deleteMany({
      where: {
        assignEmployeeId: employeeId,
        assignPermissionId: { in: permissionIds },
      },
    });
  },

  async deleteByEmployee(employeeId) {
    return prisma.assign.deleteMany({
      where: { assignEmployeeId: employeeId },
    });
  },
};

export const AssignService = {
  async getByEmployee(employeeId) {
    return AssignRepository.findByEmployee(employeeId);
  },

  async syncPermissions(employeeId, newPermissionIds, createdBy) {
    const currentAssigns = await AssignRepository.findByEmployee(employeeId);
    const currentPermissionIds = currentAssigns.map(
      (a) => a.assignPermissionId
    );

    const toAdd = newPermissionIds.filter(
      (id) => !currentPermissionIds.includes(id)
    );

    const toRemove = currentPermissionIds.filter(
      (id) => !newPermissionIds.includes(id)
    );

    const now = getLocalNow();

    if (toAdd.length > 0) {
      const dataToCreate = toAdd.map((permissionId) => ({
        assignEmployeeId: employeeId,
        assignPermissionId: permissionId,
        assignCreatedBy: createdBy,
        assignCreatedAt: now,
      }));
      await AssignRepository.createMany(dataToCreate);
    }

    if (toRemove.length > 0) {
      await AssignRepository.deleteByEmployeeAndPermissions(
        employeeId,
        toRemove
      );
    }

    return {
      added: toAdd.length,
      removed: toRemove.length,
    };
  },
};

export async function GetByEmployeeUseCase(employeeId) {
  const log = createLogger("GetAssignsByEmployeeUseCase");
  log.start({ employeeId });

  try {
    if (!employeeId || typeof employeeId !== "string") {
      throw new BadRequestError("Invalid Employee ID");
    }

    const items = await AssignService.getByEmployee(employeeId);
    log.success({ total: items.length });
    return items;
  } catch (error) {
    console.error("[GetAssignsByEmployeeUseCase] Error:", error);
    throw error;
  }
}

export async function SyncPermissionsUseCase(data) {
  const log = createLogger("SyncPermissionsUseCase");
  log.start({ employeeId: data?.employeeId });

  try {
    const validated = validateOrThrow(bulkAssignSchema, data);

    const employee = await prisma.employee.findUnique({
      where: { employeeId: validated.employeeId },
    });

    if (!employee) {
      throw new NotFoundError("Employee");
    }

    const result = await AssignService.syncPermissions(
      validated.employeeId,
      validated.permissionIds,
      validated.assignCreatedBy
    );

    log.success(result);
    return result;
  } catch (error) {
    console.error("[SyncPermissionsUseCase] Error:", error);
    throw error;
  }
}

export async function getAssignsByEmployee(request, employeeId) {
  try {
    const items = await GetByEmployeeUseCase(employeeId);

    return NextResponse.json({
      assigns: items,
      total: items.length,
    });
  } catch (error) {
    const status =
      error.name === "NotFoundError"
        ? 404
        : error.name === "BadRequestError"
        ? 400
        : 500;
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status }
    );
  }
}

export async function syncAssigns(request) {
  try {
    const body = await request.json();
    const result = await SyncPermissionsUseCase(body);

    return NextResponse.json({
      message: `Permissions updated successfully. Added: ${result.added}, Removed: ${result.removed}`,
      ...result,
    });
  } catch (error) {
    const status =
      error.name === "NotFoundError"
        ? 404
        : error.name === "BadRequestError"
        ? 400
        : error.name === "ValidationError"
        ? 422
        : 500;

    return NextResponse.json(
      {
        error: error.message || "Internal Server Error",
        details: error.details || null,
      },
      { status }
    );
  }
}
