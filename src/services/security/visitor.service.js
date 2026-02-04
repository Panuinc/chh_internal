import prisma from "@/lib/prisma";
import { PAGINATION } from "@/config/app.config";
import { isValidId } from "@/lib/validators";
import { getLocalNow } from "@/lib/getLocalNow";
import { z } from "zod";
import { preprocessString, preprocessEnum, formatData } from "@/lib/zodSchema";
import {
  NotFoundError,
  BadRequestError,
  validateOrThrow,
  createLogger,
} from "@/lib/shared/server";
import { saveUploadedFile, deleteFile } from "@/lib/fileStore";

/**
 * Helper function to cleanup uploaded files on error
 * @param {string[]} filePaths - Array of file paths to delete
 */
async function cleanupFiles(filePaths) {
  for (const path of filePaths) {
    if (path) {
      try {
        await deleteFile(path);
      } catch (e) {
        // Silently ignore cleanup errors
      }
    }
  }
}
import {
  notifyVisitorCheckIn,
  notifyVisitorStatusUpdate,
} from "@/lib/lineNotify";

const ENTITY_NAME = "Visitor";
const ENTITY_KEY = "visitors";
const ENTITY_SINGULAR = "visitor";

const EMPLOYEE_SELECT = {
  employeeId: true,
  employeeFirstName: true,
  employeeLastName: true,
};

export const createSchema = z.object({
  visitorFirstName: preprocessString("Please provide visitorFirstName"),
  visitorLastName: preprocessString("Please provide visitorLastName"),
  visitorCompany: preprocessString("Please provide visitorCompany"),
  visitorCarRegistration: preprocessString(
    "Please provide visitorCarRegistration"
  ),
  visitorProvince: preprocessString("Please provide visitorProvince"),
  visitorContactUserId: preprocessString("Please provide visitorContactUserId"),
  visitorContactReason: preprocessEnum(
    [
      "Shipping",
      "BillingChequeCollection",
      "JobApplication",
      "ProductPresentation",
      "Meeting",
      "Other",
    ],
    "Please provide visitorContactReason"
  ),
  visitorCreatedBy: preprocessString("Please provide the creator ID"),
});

export const updateSchema = z.object({
  visitorId: preprocessString("Please provide the visitor ID"),
  visitorFirstName: preprocessString("Please provide visitorFirstName"),
  visitorLastName: preprocessString("Please provide visitorLastName"),
  visitorCompany: preprocessString("Please provide visitorCompany"),
  visitorCarRegistration: preprocessString(
    "Please provide visitorCarRegistration"
  ),
  visitorProvince: preprocessString("Please provide visitorProvince"),
  visitorContactUserId: preprocessString("Please provide visitorContactUserId"),
  visitorContactReason: preprocessEnum(
    [
      "Shipping",
      "BillingChequeCollection",
      "JobApplication",
      "ProductPresentation",
      "Meeting",
      "Other",
    ],
    "Please provide visitorContactReason"
  ),
  visitorStatus: preprocessEnum(
    ["CheckIn", "CheckOut"],
    "Please provide visitorStatus"
  ),
  visitorUpdatedBy: preprocessString("Please provide the updater ID"),
});

export const VisitorRepository = {
  async findMany(skip = 0, take = 10) {
    return prisma.visitor.findMany({
      skip,
      take,
      orderBy: { visitorCreatedAt: "desc" },
      include: {
        contactUser: { select: EMPLOYEE_SELECT },
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
        contactUser: { select: EMPLOYEE_SELECT },
        createdByEmployee: { select: EMPLOYEE_SELECT },
        updatedByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async create(data) {
    return prisma.visitor.create({
      data,
      include: {
        contactUser: { select: EMPLOYEE_SELECT },
        createdByEmployee: { select: EMPLOYEE_SELECT },
      },
    });
  },

  async update(id, data) {
    return prisma.visitor.update({
      where: { visitorId: id },
      data,
      include: {
        contactUser: { select: EMPLOYEE_SELECT },
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

  async create(data) {
    return VisitorRepository.create(data);
  },

  async update(id, data) {
    return VisitorRepository.update(id, data);
  },
};

export async function GetAllUseCase(page = 1, limit = PAGINATION.DEFAULT_LIMIT) {
  const log = createLogger("GetAllVisitorUseCase");
  log.start({ page, limit });

  try {
    const skip = (page - 1) * limit;
    const { items, total } = await VisitorService.getPaginated(skip, limit);

    log.success({ total, returned: items.length });
    return { items, total };
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function GetByIdUseCase(id) {
  const log = createLogger("GetVisitorByIdUseCase");
  log.start({ id });

  try {
    if (!id || !isValidId(id)) {
      throw new BadRequestError(`Invalid ${ENTITY_NAME} ID format`);
    }

    const item = await VisitorService.findById(id);
    if (!item) {
      throw new NotFoundError(ENTITY_NAME);
    }

    log.success({
      id,
      name: `${item.visitorFirstName} ${item.visitorLastName}`,
    });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export async function CreateUseCase(data, visitorPhoto, visitorDocumentPhotos) {
  const log = createLogger("CreateVisitorUseCase");
  log.start({ name: `${data?.visitorFirstName} ${data?.visitorLastName}` });

  const validated = validateOrThrow(createSchema, data);
  const timestamp = Date.now();
  const baseName = `visitor_${timestamp}`;
  const uploadedFiles = [];

  try {
    // 1. Save files first (these need cleanup if DB fails)
    let photoPath = "";
    if (visitorPhoto) {
      photoPath = await saveUploadedFile(
        visitorPhoto,
        "visitors/photos",
        baseName
      );
      uploadedFiles.push(photoPath);
    }

    let documentPhotosPath = "";
    const documentPaths = [];
    if (visitorDocumentPhotos && visitorDocumentPhotos.length > 0) {
      for (let i = 0; i < visitorDocumentPhotos.length; i++) {
        const docPath = await saveUploadedFile(
          visitorDocumentPhotos[i],
          "visitors/documents",
          `${baseName}_doc${i}`
        );
        documentPaths.push(docPath);
        uploadedFiles.push(docPath);
      }
      documentPhotosPath = JSON.stringify(documentPaths);
    }

    // 2. Create DB record within transaction
    const item = await prisma.$transaction(async (tx) => {
      return await tx.visitor.create({
        data: {
          ...validated,
          visitorPhoto: photoPath,
          visitorDocumentPhotos: documentPhotosPath,
          visitorStatus: "CheckIn",
          visitorCreatedAt: getLocalNow(),
        },
        include: {
          contactUser: { select: EMPLOYEE_SELECT },
          createdByEmployee: { select: EMPLOYEE_SELECT },
        },
      });
    });

    // 3. Send notification (outside transaction - non-critical)
    try {
      const contactUser = item.contactUser
        ? {
            userFirstName: item.contactUser.employeeFirstName,
            userLastName: item.contactUser.employeeLastName,
          }
        : null;

      await notifyVisitorCheckIn(item, contactUser);
      log.success({ lineNotification: "sent" });
    } catch (lineError) {
      log.error({ error: lineError.message });
    }

    log.success({
      id: item.visitorId,
      name: `${item.visitorFirstName} ${item.visitorLastName}`,
    });
    return item;
  } catch (error) {
    // Cleanup uploaded files on error
    await cleanupFiles(uploadedFiles);
    log.error({ error: error.message });
    throw error;
  }
}

export async function UpdateUseCase(data, visitorPhoto, visitorDocumentPhotos) {
  const log = createLogger("UpdateVisitorUseCase");
  log.start({ id: data?.visitorId });

  const validated = validateOrThrow(updateSchema, data);
  const { visitorId, ...updateData } = validated;
  const newUploadedFiles = [];
  const deletedOldFiles = [];

  try {
    // 1. Find existing record first
    const existing = await VisitorService.findById(visitorId);
    if (!existing) {
      throw new NotFoundError(ENTITY_NAME);
    }

    // 2. Save new files first (before deleting old ones)
    const timestamp = Date.now();
    const baseName = `visitor_${timestamp}`;

    let photoPath = existing.visitorPhoto;
    if (visitorPhoto) {
      const newPhotoPath = await saveUploadedFile(
        visitorPhoto,
        "visitors/photos",
        baseName
      );
      photoPath = newPhotoPath;
      newUploadedFiles.push(newPhotoPath);
      if (existing.visitorPhoto) {
        deletedOldFiles.push(existing.visitorPhoto);
      }
    }

    let documentPhotosPath = existing.visitorDocumentPhotos;
    if (visitorDocumentPhotos && visitorDocumentPhotos.length > 0) {
      const paths = [];
      for (let i = 0; i < visitorDocumentPhotos.length; i++) {
        const docPath = await saveUploadedFile(
          visitorDocumentPhotos[i],
          "visitors/documents",
          `${baseName}_doc${i}`
        );
        paths.push(docPath);
        newUploadedFiles.push(docPath);
      }
      documentPhotosPath = JSON.stringify(paths);
      
      // Mark old documents for deletion
      if (existing.visitorDocumentPhotos) {
        try {
          const oldPaths = JSON.parse(existing.visitorDocumentPhotos);
          deletedOldFiles.push(...oldPaths);
        } catch (_) {}
      }
    }

    // 3. Update DB record within transaction
    const item = await prisma.$transaction(async (tx) => {
      return await tx.visitor.update({
        where: { visitorId },
        data: {
          ...updateData,
          visitorPhoto: photoPath,
          visitorDocumentPhotos: documentPhotosPath,
          visitorUpdatedAt: getLocalNow(),
        },
        include: {
          contactUser: { select: EMPLOYEE_SELECT },
          createdByEmployee: { select: EMPLOYEE_SELECT },
          updatedByEmployee: { select: EMPLOYEE_SELECT },
        },
      });
    });

    // 4. Delete old files only after DB update succeeds
    for (const oldPath of deletedOldFiles) {
      try {
        await deleteFile(oldPath);
      } catch (e) {
        log.error({ message: "Failed to delete old file", path: oldPath });
      }
    }

    // 5. Send notification (outside transaction)
    if (
      updateData.visitorStatus &&
      updateData.visitorStatus !== existing.visitorStatus
    ) {
      try {
        const contactUser = item.contactUser
          ? {
              userFirstName: item.contactUser.employeeFirstName,
              userLastName: item.contactUser.employeeLastName,
            }
          : null;

        await notifyVisitorStatusUpdate(
          item,
          contactUser,
          updateData.visitorStatus
        );
        log.success({
          lineNotification: "sent",
          newStatus: updateData.visitorStatus,
        });
      } catch (lineError) {
        log.error({ error: lineError.message });
      }
    }

    log.success({
      id: visitorId,
      name: `${item.visitorFirstName} ${item.visitorLastName}`,
    });
    return item;
  } catch (error) {
    // Cleanup newly uploaded files on error
    await cleanupFiles(newUploadedFiles);
    log.error({ error: error.message });
    throw error;
  }
}

export async function CheckoutUseCase(visitorId, updatedBy) {
  const log = createLogger("CheckoutVisitorUseCase");
  log.start({ visitorId });

  try {
    if (!visitorId || !isValidId(visitorId)) {
      throw new BadRequestError(`Invalid ${ENTITY_NAME} ID format`);
    }

    const existing = await VisitorService.findById(visitorId);
    if (!existing) {
      throw new NotFoundError(ENTITY_NAME);
    }

    if (existing.visitorStatus === "CheckOut") {
      throw new BadRequestError("Visitor has already checked out");
    }

    const item = await VisitorService.update(visitorId, {
      visitorStatus: "CheckOut",
      visitorUpdatedBy: updatedBy,
      visitorUpdatedAt: getLocalNow(),
    });

    try {
      const contactUser = item.contactUser
        ? {
            userFirstName: item.contactUser.employeeFirstName,
            userLastName: item.contactUser.employeeLastName,
          }
        : null;

      await notifyVisitorStatusUpdate(item, contactUser, "CheckOut");
      log.success({ lineNotification: "sent", status: "CheckOut" });
    } catch (lineError) {
      log.error({ error: lineError.message });
    }

    log.success({
      id: visitorId,
      name: `${item.visitorFirstName} ${item.visitorLastName}`,
      status: "CheckOut",
    });
    return item;
  } catch (error) {
    log.error({ error: error.message });
    throw error;
  }
}

export function formatVisitorData(items) {
  return formatData(items, [], ["visitorCreatedAt", "visitorUpdatedAt"]);
}

async function parseFormData(request) {
  const formData = await request.formData();
  const data = {};
  let visitorPhoto = null;
  const visitorDocumentPhotos = [];

  for (const [key, value] of formData.entries()) {
    if (key === "visitorPhoto" && value instanceof File && value.size > 0) {
      visitorPhoto = value;
    } else if (
      key === "visitorDocumentPhotos" &&
      value instanceof File &&
      value.size > 0
    ) {
      visitorDocumentPhotos.push(value);
    } else if (typeof value === "string") {
      data[key] = value;
    }
  }

  return { data, visitorPhoto, visitorDocumentPhotos };
}

export async function getAllVisitor(request) {
  const log = createLogger("getAllVisitor");
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT), 10),
      PAGINATION.MAX_LIMIT
    );

    const { items, total } = await GetAllUseCase(page, limit);
    const formatted = formatVisitorData(items);

    return Response.json({
      [ENTITY_KEY]: formatted,
      total,
      page,
      limit,
    });
  } catch (error) {
    log.error({ error: error.message });
    const status = error.statusCode || 500;
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status }
    );
  }
}

export async function getVisitorById(request, visitorId) {
  const log = createLogger("getVisitorById");
  try {
    const item = await GetByIdUseCase(visitorId);
    const formatted = formatVisitorData([item])[0];

    return Response.json({ [ENTITY_SINGULAR]: formatted });
  } catch (error) {
    log.error({ error: error.message });
    const status = error.statusCode || 500;
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status }
    );
  }
}

export async function createVisitor(request) {
  const log = createLogger("createVisitor");
  try {
    const { data, visitorPhoto, visitorDocumentPhotos } = await parseFormData(
      request
    );
    const item = await CreateUseCase(data, visitorPhoto, visitorDocumentPhotos);
    const formatted = formatVisitorData([item])[0];

    return Response.json(
      { message: "Visitor created successfully", [ENTITY_SINGULAR]: formatted },
      { status: 201 }
    );
  } catch (error) {
    log.error({ error: error.message });
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

export async function updateVisitor(request, visitorId) {
  const log = createLogger("updateVisitor");
  try {
    const { data, visitorPhoto, visitorDocumentPhotos } = await parseFormData(
      request
    );
    const item = await UpdateUseCase(
      { ...data, visitorId },
      visitorPhoto,
      visitorDocumentPhotos
    );
    const formatted = formatVisitorData([item])[0];

    return Response.json({
      message: "Visitor updated successfully",
      [ENTITY_SINGULAR]: formatted,
    });
  } catch (error) {
    log.error({ error: error.message });
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

export async function checkoutVisitor(request, visitorId) {
  const log = createLogger("checkoutVisitor");
  try {
    const body = await request.json().catch(() => ({}));
    const updatedBy = body.updatedBy;

    if (!updatedBy) {
      return Response.json({ error: "updatedBy is required" }, { status: 400 });
    }

    const item = await CheckoutUseCase(visitorId, updatedBy);
    const formatted = formatVisitorData([item])[0];

    return Response.json({
      message: "Visitor checked out successfully",
      [ENTITY_SINGULAR]: formatted,
    });
  } catch (error) {
    log.error({ error: error.message });
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
