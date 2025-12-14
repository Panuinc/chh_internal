import { PermissionService } from "@/app/api/hr/permission/core/permission.service";
import {
  permissionPostSchema,
  permissionPutSchema,
} from "@/app/api/hr/permission/core/permission.schema";
import { PermissionValidator } from "@/app/api/hr/permission/core/permission.validator";
import { getLocalNow } from "@/lib/getLocalNow";
import logger from "@/lib/logger.node";

export async function GetAllPermissionUseCase(page = 1, limit = 1000000) {
  logger.info("GetAllPermissionUseCase start", { page, limit });

  try {
    const skip = (page - 1) * limit;
    const permissions = await PermissionService.getAllPaginated(skip, limit);
    const total = await PermissionService.countAll();

    logger.info("GetAllPermissionUseCase success", {
      total,
      returned: permissions.length,
    });

    return { permissions, total };
  } catch (error) {
    logger.error("GetAllPermissionUseCase error", { error });
    throw error;
  }
}

export async function GetPermissionByIdUseCase(permissionId) {
  logger.info("GetPermissionByIdUseCase start", { permissionId });

  if (!permissionId || typeof permissionId !== "string") {
    logger.warn("GetPermissionByIdUseCase invalid ID", { permissionId });
    throw { status: 400, message: "Invalid permission ID" };
  }

  try {
    const permission = await PermissionService.getById(permissionId);

    if (!permission) {
      logger.warn("GetPermissionByIdUseCase not found", { permissionId });
      throw { status: 404, message: "Permission not found" };
    }

    logger.info("GetPermissionByIdUseCase success", {
      permissionId,
      permissionName: permission.permissionName,
    });

    return permission;
  } catch (error) {
    if (error?.status) {
      throw error;
    }
    logger.error("GetPermissionByIdUseCase error", { permissionId, error });
    throw error;
  }
}

export async function CreatePermissionUseCase(data) {
  logger.info("CreatePermissionUseCase start", {
    permissionName: data?.permissionName,
    permissionCreatedBy: data?.permissionCreatedBy,
  });

  const parsed = permissionPostSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    logger.warn("CreatePermissionUseCase validation failed", {
      errors: fieldErrors,
    });

    throw {
      status: 422,
      message: "Invalid input",
      details: fieldErrors,
    };
  }

  const normalizedPermissionName = parsed.data.permissionName
    .trim()
    .toLowerCase();

  const duplicate = await PermissionValidator.isDuplicatePermissionName(
    normalizedPermissionName
  );
  if (duplicate) {
    logger.warn("CreatePermissionUseCase duplicate permissionName", {
      permissionName: normalizedPermissionName,
    });

    throw {
      status: 409,
      message: `permissionName '${normalizedPermissionName}' already exists`,
    };
  }

  try {
    const permission = await PermissionService.create({
      ...parsed.data,
      permissionName: normalizedPermissionName,
      permissionCreatedAt: getLocalNow(),
    });

    logger.info("CreatePermissionUseCase success", {
      permissionId: permission.permissionId,
      permissionName: permission.permissionName,
    });

    return permission;
  } catch (error) {
    if (error && typeof error === "object" && error.code === "P2002") {
      logger.warn(
        "CreatePermissionUseCase unique constraint violation (P2002)",
        {
          permissionName: normalizedPermissionName,
        }
      );

      throw {
        status: 409,
        message: `permissionName '${normalizedPermissionName}' already exists`,
      };
    }

    logger.error("CreatePermissionUseCase error", { error });

    throw error;
  }
}

export async function UpdatePermissionUseCase(data) {
  logger.info("UpdatePermissionUseCase start", {
    permissionId: data?.permissionId,
    permissionName: data?.permissionName,
    permissionUpdatedBy: data?.permissionUpdatedBy,
  });

  const parsed = permissionPutSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    logger.warn("UpdatePermissionUseCase validation failed", {
      errors: fieldErrors,
    });

    throw {
      status: 422,
      message: "Invalid input",
      details: fieldErrors,
    };
  }

  const existing = await PermissionService.getById(parsed.data.permissionId);
  if (!existing) {
    logger.warn("UpdatePermissionUseCase permission not found", {
      permissionId: parsed.data.permissionId,
    });

    throw { status: 404, message: "Permission not found" };
  }

  const normalizedPermissionName = parsed.data.permissionName
    .trim()
    .toLowerCase();
  const existingPermissionNameNormalized = existing.permissionName
    ? existing.permissionName.trim().toLowerCase()
    : "";

  if (normalizedPermissionName !== existingPermissionNameNormalized) {
    const duplicate = await PermissionValidator.isDuplicatePermissionName(
      normalizedPermissionName
    );
    if (duplicate) {
      logger.warn("UpdatePermissionUseCase duplicate permissionName", {
        permissionName: normalizedPermissionName,
      });

      throw {
        status: 409,
        message: `permissionName '${normalizedPermissionName}' already exists`,
      };
    }
  }

  const { permissionId, ...rest } = parsed.data;

  try {
    const updatedPermission = await PermissionService.update(permissionId, {
      ...rest,
      permissionName: normalizedPermissionName,
      permissionUpdatedAt: getLocalNow(),
    });

    logger.info("UpdatePermissionUseCase success", {
      permissionId,
      permissionName: updatedPermission.permissionName,
      permissionStatus: updatedPermission.permissionStatus,
    });

    return updatedPermission;
  } catch (error) {
    if (error && typeof error === "object" && error.code === "P2002") {
      logger.warn(
        "UpdatePermissionUseCase unique constraint violation (P2002)",
        {
          permissionName: normalizedPermissionName,
        }
      );

      throw {
        status: 409,
        message: `permissionName '${normalizedPermissionName}' already exists`,
      };
    }

    logger.error("UpdatePermissionUseCase error", { error });

    throw error;
  }
}
