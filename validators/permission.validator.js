/**
 * Permission Validator
 * จัดการ Input Validation สำหรับ Permission
 */

export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
    this.statusCode = 400;
  }
}

export const PermissionValidator = {
  /**
   * Validate permission name format
   * Allowed: superAdmin, admin, hr.view, hr.employee.view, hr.*
   */
  isValidPermissionName(name) {
    const pattern = /^[a-zA-Z]+(\.[a-zA-Z*]+)*$/;
    return pattern.test(name);
  },

  /**
   * Validate create permission input
   */
  validateCreateInput(data) {
    const errors = [];

    // Check required fields
    if (!data.permName || typeof data.permName !== "string") {
      errors.push({
        field: "permName",
        message: "Permission name is required",
      });
    } else {
      const trimmedName = data.permName.trim();

      if (!trimmedName) {
        errors.push({
          field: "permName",
          message: "Permission name cannot be empty",
        });
      } else if (!this.isValidPermissionName(trimmedName)) {
        errors.push({
          field: "permName",
          message:
            "Invalid permission name format. Use: module.action or module.submodule.action",
        });
      } else if (trimmedName.length > 100) {
        errors.push({
          field: "permName",
          message: "Permission name must be less than 100 characters",
        });
      }
    }

    if (!data.createdBy) {
      errors.push({
        field: "createdBy",
        message: "Creator ID is required",
      });
    }

    if (errors.length > 0) {
      const error = new ValidationError(errors[0].message, errors[0].field);
      error.errors = errors;
      throw error;
    }

    return {
      permName: data.permName.trim(),
      createdBy: data.createdBy,
    };
  },

  /**
   * Validate update permission input
   */
  validateUpdateInput(data) {
    const errors = [];

    // Validate permName if provided
    if (data.permName !== undefined) {
      if (typeof data.permName !== "string") {
        errors.push({
          field: "permName",
          message: "Permission name must be a string",
        });
      } else {
        const trimmedName = data.permName.trim();

        if (!trimmedName) {
          errors.push({
            field: "permName",
            message: "Permission name cannot be empty",
          });
        } else if (!this.isValidPermissionName(trimmedName)) {
          errors.push({
            field: "permName",
            message:
              "Invalid permission name format. Use: module.action or module.submodule.action",
          });
        } else if (trimmedName.length > 100) {
          errors.push({
            field: "permName",
            message: "Permission name must be less than 100 characters",
          });
        }
      }
    }

    // Validate permStatus if provided
    if (data.permStatus !== undefined) {
      const validStatuses = ["Active", "Inactive"];
      if (!validStatuses.includes(data.permStatus)) {
        errors.push({
          field: "permStatus",
          message: "Invalid status. Must be 'Active' or 'Inactive'",
        });
      }
    }

    if (!data.updatedBy) {
      errors.push({
        field: "updatedBy",
        message: "Updater ID is required",
      });
    }

    if (errors.length > 0) {
      const error = new ValidationError(errors[0].message, errors[0].field);
      error.errors = errors;
      throw error;
    }

    return {
      permName: data.permName?.trim(),
      permStatus: data.permStatus,
      updatedBy: data.updatedBy,
    };
  },

  /**
   * Validate query parameters
   */
  validateQueryParams(params) {
    const validOrderBy = [
      "permName",
      "permStatus",
      "permCreatedAt",
      "permUpdatedAt",
    ];
    const validOrder = ["asc", "desc"];
    const validStatuses = ["Active", "Inactive", "all"];

    const status = params.status || "Active";
    const orderBy = params.orderBy || "permName";
    const order = params.order || "asc";

    if (!validStatuses.includes(status)) {
      throw new ValidationError(
        "Invalid status filter. Must be 'Active', 'Inactive', or 'all'",
        "status"
      );
    }

    if (!validOrderBy.includes(orderBy)) {
      throw new ValidationError(
        `Invalid orderBy. Must be one of: ${validOrderBy.join(", ")}`,
        "orderBy"
      );
    }

    if (!validOrder.includes(order)) {
      throw new ValidationError(
        "Invalid order. Must be 'asc' or 'desc'",
        "order"
      );
    }

    return {
      status: status === "all" ? null : status,
      orderBy,
      order,
    };
  },

  /**
   * Validate permission ID
   */
  validatePermissionId(permId) {
    if (!permId || typeof permId !== "string") {
      throw new ValidationError("Permission ID is required", "permId");
    }

    // UUID format validation (optional - depends on your ID format)
    // const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // if (!uuidPattern.test(permId)) {
    //   throw new ValidationError("Invalid permission ID format", "permId");
    // }

    return permId;
  },
};

export default PermissionValidator;