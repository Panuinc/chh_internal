import prisma from "@/lib/prisma";
import { getLocalNow } from "@/lib/getLocalNow";
import { z } from "zod";
import { preprocessString, formatData } from "@/lib/zodSchema";
import {
  BadRequestError,
  validateOrThrow,
  createLogger,
} from "@/lib/shared/server";
import { saveUploadedFile } from "@/lib/fileStore";

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

export async function GetAllUseCase(page = 1, limit = 1000000) {
  const log = createLogger("GetAllPatrolUseCase");
  log.start({ page, limit });

  try {
    const skip = (page - 1) * limit;
    const { items, total } = await PatrolService.getPaginated(skip, limit);

    log.success({ total, returned: items.length });
    return { items, total };
  } catch (error) {
    console.error("[GetAllPatrolUseCase] Error:", error);
    throw error;
  }
}

export async function CreateUseCase(data, patrolPicture) {
  const log = createLogger("CreatePatrolUseCase");
  log.start({ qrCodeInfo: data?.patrolQrCodeInfo });

  try {
    const validated = validateOrThrow(createSchema, data);

    const timestamp = Date.now();
    const baseName = `patrol_${timestamp}`;

    let picturePath = "";
    if (patrolPicture) {
      picturePath = await saveUploadedFile(
        patrolPicture,
        "patrols/pictures",
        baseName
      );
    }

    const item = await PatrolService.create({
      ...validated,
      patrolPicture: picturePath,
      patrolCreatedAt: getLocalNow(),
    });

    log.success({
      id: item.patrolId,
      qrCodeInfo: item.patrolQrCodeInfo,
    });
    return item;
  } catch (error) {
    console.error("[CreatePatrolUseCase] Error:", error);
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
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "1000000", 10);

    const { items, total } = await GetAllUseCase(page, limit);
    const formatted = formatPatrolData(items);

    return Response.json({
      [ENTITY_KEY]: formatted,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[getAllPatrol] Error:", error);
    const status = error.statusCode || 500;
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status }
    );
  }
}

export async function createPatrol(request) {
  try {
    const { data, patrolPicture } = await parseFormData(request);
    const item = await CreateUseCase(data, patrolPicture);
    const formatted = formatPatrolData([item])[0];

    return Response.json(
      { message: "Patrol created successfully", [ENTITY_SINGULAR]: formatted },
      { status: 201 }
    );
  } catch (error) {
    console.error("[createPatrol] Error:", error);
    const status = error.statusCode || 500;
    return Response.json(
      {
        error: error.message || "Internal Server Error",
        details: error.details || null,
      },
      { status }
    );
  }
}
