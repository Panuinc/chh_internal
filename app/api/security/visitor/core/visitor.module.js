import prisma from "@/lib/prisma";
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

    log.success({
      id,
      name: `${item.visitorFirstName} ${item.visitorLastName}`,
    });
    return item;
  } catch (error) {
    console.error("[GetVisitorByIdUseCase] Error:", error);
    throw error;
  }
}

export async function CreateUseCase(data, visitorPhoto, visitorDocumentPhotos) {
  const log = createLogger("CreateVisitorUseCase");
  log.start({ name: `${data?.visitorFirstName} ${data?.visitorLastName}` });

  try {
    const validated = validateOrThrow(createSchema, data);

    const timestamp = Date.now();
    const baseName = `visitor_${timestamp}`;

    let photoPath = "";
    if (visitorPhoto) {
      photoPath = await saveUploadedFile(
        visitorPhoto,
        "visitors/photos",
        baseName
      );
    }

    let documentPhotosPath = "";
    if (visitorDocumentPhotos && visitorDocumentPhotos.length > 0) {
      const paths = [];
      for (let i = 0; i < visitorDocumentPhotos.length; i++) {
        const docPath = await saveUploadedFile(
          visitorDocumentPhotos[i],
          "visitors/documents",
          `${baseName}_doc${i}`
        );
        paths.push(docPath);
      }
      documentPhotosPath = JSON.stringify(paths);
    }

    const item = await VisitorService.create({
      ...validated,
      visitorPhoto: photoPath,
      visitorDocumentPhotos: documentPhotosPath,
      visitorStatus: "CheckIn",
      visitorCreatedAt: getLocalNow(),
    });

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
      console.error(
        "[CreateVisitorUseCase] LINE notification failed:",
        lineError
      );
    }

    log.success({
      id: item.visitorId,
      name: `${item.visitorFirstName} ${item.visitorLastName}`,
    });
    return item;
  } catch (error) {
    console.error("[CreateVisitorUseCase] Error:", error);
    throw error;
  }
}

export async function UpdateUseCase(data, visitorPhoto, visitorDocumentPhotos) {
  const log = createLogger("UpdateVisitorUseCase");
  log.start({ id: data?.visitorId });

  try {
    const validated = validateOrThrow(updateSchema, data);
    const { visitorId, ...updateData } = validated;

    const existing = await VisitorService.findById(visitorId);
    if (!existing) {
      throw new NotFoundError(ENTITY_NAME);
    }

    let photoPath = existing.visitorPhoto;
    if (visitorPhoto) {
      if (existing.visitorPhoto) {
        await deleteFile(existing.visitorPhoto);
      }
      const timestamp = Date.now();
      const baseName = `visitor_${timestamp}`;
      photoPath = await saveUploadedFile(
        visitorPhoto,
        "visitors/photos",
        baseName
      );
    }

    let documentPhotosPath = existing.visitorDocumentPhotos;
    if (visitorDocumentPhotos && visitorDocumentPhotos.length > 0) {
      if (existing.visitorDocumentPhotos) {
        try {
          const oldPaths = JSON.parse(existing.visitorDocumentPhotos);
          for (const oldPath of oldPaths) {
            await deleteFile(oldPath);
          }
        } catch (_) {}
      }
      const timestamp = Date.now();
      const baseName = `visitor_${timestamp}`;
      const paths = [];
      for (let i = 0; i < visitorDocumentPhotos.length; i++) {
        const docPath = await saveUploadedFile(
          visitorDocumentPhotos[i],
          "visitors/documents",
          `${baseName}_doc${i}`
        );
        paths.push(docPath);
      }
      documentPhotosPath = JSON.stringify(paths);
    }

    const item = await VisitorService.update(visitorId, {
      ...updateData,
      visitorPhoto: photoPath,
      visitorDocumentPhotos: documentPhotosPath,
      visitorUpdatedAt: getLocalNow(),
    });

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
        console.error(
          "[UpdateVisitorUseCase] LINE notification failed:",
          lineError
        );
      }
    }

    log.success({
      id: visitorId,
      name: `${item.visitorFirstName} ${item.visitorLastName}`,
    });
    return item;
  } catch (error) {
    console.error("[UpdateVisitorUseCase] Error:", error);
    throw error;
  }
}

export async function CheckoutUseCase(visitorId, updatedBy) {
  const log = createLogger("CheckoutVisitorUseCase");
  log.start({ visitorId });

  try {
    if (!visitorId || typeof visitorId !== "string") {
      throw new BadRequestError(`Invalid ${ENTITY_NAME} ID`);
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
      console.error(
        "[CheckoutVisitorUseCase] LINE notification failed:",
        lineError
      );
    }

    log.success({
      id: visitorId,
      name: `${item.visitorFirstName} ${item.visitorLastName}`,
      status: "CheckOut",
    });
    return item;
  } catch (error) {
    console.error("[CheckoutVisitorUseCase] Error:", error);
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
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "1000000", 10);

    const { items, total } = await GetAllUseCase(page, limit);
    const formatted = formatVisitorData(items);

    return Response.json({
      [ENTITY_KEY]: formatted,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[getAllVisitor] Error:", error);
    const status = error.statusCode || 500;
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status }
    );
  }
}

export async function getVisitorById(request, visitorId) {
  try {
    const item = await GetByIdUseCase(visitorId);
    const formatted = formatVisitorData([item])[0];

    return Response.json({ [ENTITY_SINGULAR]: formatted });
  } catch (error) {
    console.error("[getVisitorById] Error:", error);
    const status = error.statusCode || 500;
    return Response.json(
      { error: error.message || "Internal Server Error" },
      { status }
    );
  }
}

export async function createVisitor(request) {
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
    console.error("[createVisitor] Error:", error);
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
    console.error("[updateVisitor] Error:", error);
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
    console.error("[checkoutVisitor] Error:", error);
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
