import PermissionRepository from "@/repositories/permission.repository";
import PermissionValidator from "@/validators/permission.validator";
import { toPermissionDTO, toSimplePermissionDTO } from "@/schemas/permission.schema";

/**
 * Custom Errors for Usecases
 */
export class NotFoundError extends Error {
  constructor(message = "Permission not found") {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

export class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
    this.statusCode = 409;
  }
}

export class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = "ForbiddenError";
    this.statusCode = 403;
  }
}

/**
 * Use Case: Get All Permissions
 */
export class GetAllPermissionsUseCase {
  async execute(queryParams = {}) {
    // Validate query params
    const validatedParams = PermissionValidator.validateQueryParams(queryParams);

    // Fetch from repository
    const permissions = await PermissionRepository.findAll(validatedParams);

    // Transform to DTOs
    return permissions.map(toPermissionDTO);
  }
}

/**
 * Use Case: Get Permission By ID
 */
export class GetPermissionByIdUseCase {
  async execute(permId) {
    // Validate ID
    PermissionValidator.validatePermissionId(permId);

    // Fetch from repository
    const permission = await PermissionRepository.findById(permId);

    if (!permission) {
      throw new NotFoundError("Permission not found");
    }

    // Transform to DTO
    return toPermissionDTO(permission);
  }
}

/**
 * Use Case: Create Permission
 */
export class CreatePermissionUseCase {
  async execute(input) {
    // Validate input
    const validatedInput = PermissionValidator.validateCreateInput(input);

    // Check for duplicate
    const existing = await PermissionRepository.findByName(validatedInput.permName);
    if (existing) {
      throw new ConflictError("Permission already exists");
    }

    // Create permission
    const permission = await PermissionRepository.create({
      permName: validatedInput.permName,
      permStatus: "Active",
      createdBy: validatedInput.createdBy,
    });

    // Return simple DTO
    return toSimplePermissionDTO(permission);
  }
}

/**
 * Use Case: Update Permission
 */
export class UpdatePermissionUseCase {
  async execute(permId, input) {
    // Validate ID
    PermissionValidator.validatePermissionId(permId);

    // Validate input
    const validatedInput = PermissionValidator.validateUpdateInput(input);

    // Check permission exists
    const existing = await PermissionRepository.findById(permId);
    if (!existing) {
      throw new NotFoundError("Permission not found");
    }

    // Check for duplicate name (if changing name)
    if (validatedInput.permName && validatedInput.permName !== existing.permName) {
      const duplicate = await PermissionRepository.findByName(validatedInput.permName);
      if (duplicate) {
        throw new ConflictError("Permission name already exists");
      }
    }

    // Update permission
    const permission = await PermissionRepository.update(permId, {
      permName: validatedInput.permName || existing.permName,
      permStatus: validatedInput.permStatus || existing.permStatus,
      updatedBy: validatedInput.updatedBy,
    });

    return toSimplePermissionDTO(permission);
  }
}

/**
 * Use Case: Delete Permission (Soft Delete)
 */
export class DeletePermissionUseCase {
  async execute(permId, userId) {
    // Validate ID
    PermissionValidator.validatePermissionId(permId);

    // Check permission exists
    const existing = await PermissionRepository.findById(permId);
    if (!existing) {
      throw new NotFoundError("Permission not found");
    }

    // Prevent deleting superAdmin
    if (existing.permName === "superAdmin") {
      throw new ForbiddenError("Cannot delete superAdmin permission");
    }

    // Soft delete
    await PermissionRepository.softDelete(permId, userId);

    return { message: "Permission deleted successfully" };
  }
}

/**
 * Use Case: Get Permission Statistics
 */
export class GetPermissionStatisticsUseCase {
  async execute() {
    const [activeCount, inactiveCount, totalCount] = await Promise.all([
      PermissionRepository.count("Active"),
      PermissionRepository.count("Inactive"),
      PermissionRepository.count(),
    ]);

    return {
      total: totalCount,
      active: activeCount,
      inactive: inactiveCount,
    };
  }
}

/**
 * Use Case: Check Permission Exists
 */
export class CheckPermissionExistsUseCase {
  async execute(permName) {
    const permission = await PermissionRepository.findByName(permName);
    return {
      exists: !!permission,
      permission: permission ? toSimplePermissionDTO(permission) : null,
    };
  }
}

/**
 * Use Case Factory - สร้าง instance ของ use cases
 */
export const PermissionUseCases = {
  getAllPermissions: new GetAllPermissionsUseCase(),
  getPermissionById: new GetPermissionByIdUseCase(),
  createPermission: new CreatePermissionUseCase(),
  updatePermission: new UpdatePermissionUseCase(),
  deletePermission: new DeletePermissionUseCase(),
  getStatistics: new GetPermissionStatisticsUseCase(),
  checkExists: new CheckPermissionExistsUseCase(),
};

export default PermissionUseCases;