import prisma from "@/lib/prisma";
import { PAGINATION } from "@/config/app.config";
import { isValidId } from "@/lib/validators";
import { getLocalNow } from "@/lib/getLocalNow";
import { z } from "zod";
import { preprocessString, formatData } from "@/lib/zodSchema";
import {
  BadRequestError,
  validateOrThrow,
  createLogger,
  successResponse,
  errorResponse,
} from "@/lib/shared/server";
import { saveUploadedFile, deleteFile } from "@/lib/fileStore";

async function cleanupFiles(filePaths) {
  for (const path of filePaths) {
    if (path) {
      try {
        await deleteFile(path);
      } catch (e) {

      }
    }
  }
}

const ENTITY_NAME = "Patrol";
const ENTITY_KEY = "patrols";
const ENTITY_SINGULAR = "patrol";

const EMPLOYEE_SELECT = {
  employeeId: true,
  employeeFirstName: true,
  employeeLastName: true,
};

export const createSchema = z.object({
  patrolQrCodeInfo: preprocessString("Please provide patrolQrCodeInfo"),
  patrolNote: z.string().optional().default(""),
  patrolCreatedBy: preprocessString("Please provide the creator ID"),
});

export const PatrolRepository = {
  async findMany(skip = 0, take = 10) {
    return prisma.patrol.findMany({
      skip,
      take,
      orderBy: { patrolCreatedAt: "desc" },
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async count() {
    return prisma.patrol.count();
  },

  async create(data) {
    return prisma.patrol.create({
      data,
      include: {
        createdByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },
};

export const PatrolService = {
  async getPaginated(skip, take) {
    const [items, total] = await Promise.all([
      PatrolRepository.findMany(skip, take),
      PatrolRepository.count(),
    ]);
    return { items, total };
  },

  async create(data) {
    return PatrolRepository.create(data);
  },
};

export async function GetAllUseCase(page = 1, limit = PAGINATION.DEFAULT_LIMIT) {
  const log = createLogger("GetAllPatrolUseCase");
  log.start({ page, limit });

  try {
    const skip = (page - 1) * limit;
    const { items, total } = await PatrolService.getPaginated(skip, limit);

    log.success({ total, returned: items.length });
    return { items, total };
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function CreateUseCase(data, patrolPicture) {
  const log = createLogger("CreatePatrolUseCase");
  log.start({ qrCodeInfo: data?.patrolQrCodeInfo });

  const validated = validateOrThrow(createSchema, data);
  const timestamp = Date.now();
  const baseName = `patrol_${timestamp}`;
  const uploadedFiles = [];

  try {

    let picturePath = "";
    if (patrolPicture) {
      picturePath = await saveUploadedFile(
        patrolPicture,
        "patrols/pictures",
        baseName
      );
      uploadedFiles.push(picturePath);
    }

    const item = await prisma.$transaction(async (tx) => {
      return await tx.patrol.create({
        data: {
          ...validated,
          patrolPicture: picturePath,
          patrolCreatedAt: getLocalNow(),
        },
        include: {
          createdByEmployee: { select: EMPLOYEE_SELECT },
        },
      });
    });

    log.success({
      id: item.patrolId,
      qrCodeInfo: item.patrolQrCodeInfo,
    });
    return item;
  } catch (error) {

    await cleanupFiles(uploadedFiles);
    log.error({ error: error.message });
    throw error;
  }
}

export function formatPatrolData(items) {
  return formatData(items, [], ["patrolCreatedAt"]);
}

async function parseFormData(request) {
  const formData = await request.formData();
  const data = {};
  let patrolPicture = null;

  for (const [key, value] of formData.entries()) {
    if (key === "patrolPicture" && value instanceof File && value.size > 0) {
      patrolPicture = value;
    } else if (typeof value === "string") {
      data[key] = value;
    }
  }

  return { data, patrolPicture };
}

export async function getAllPatrol(request) {
  const log = createLogger("getAllPatrol");
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT), 10),
      PAGINATION.MAX_LIMIT
    );

    const { items, total } = await GetAllUseCase(page, limit);
    const formatted = formatPatrolData(items);

    return successResponse({
      [ENTITY_KEY]: formatted,
      total,
      page,
      limit,
    });
  } catch (error) {
    log.error({ error: error.message });
    return errorResponse(error);
  }
}

export async function createPatrol(request) {
  const log = createLogger("createPatrol");
  try {
    const { data, patrolPicture } = await parseFormData(request);
    const item = await CreateUseCase(data, patrolPicture);
    const formatted = formatPatrolData([item])[0];

    return successResponse(
      { message: "Patrol created successfully", [ENTITY_SINGULAR]: formatted },
      201
    );
  } catch (error) {
    log.error({ error: error.message });
    return errorResponse(error);
  }
}
