/**
 * Permission Schema
 * กำหนด Data Transfer Objects (DTOs) และ Response Structures
 */

/**
 * Permission Response DTO
 * @typedef {Object} PermissionDTO
 * @property {string} permId
 * @property {string} permName
 * @property {string} permStatus
 * @property {number} userCount
 * @property {string|null} createdBy
 * @property {Date} createdAt
 * @property {string|null} updatedBy
 * @property {Date|null} updatedAt
 */

/**
 * Create Permission Input
 * @typedef {Object} CreatePermissionInput
 * @property {string} permName
 * @property {string} createdBy
 */

/**
 * Update Permission Input
 * @typedef {Object} UpdatePermissionInput
 * @property {string} [permName]
 * @property {string} [permStatus]
 * @property {string} updatedBy
 */

/**
 * Permission Query Options
 * @typedef {Object} PermissionQueryOptions
 * @property {string|null} status
 * @property {string} orderBy
 * @property {string} order
 */

/**
 * Permission Statistics
 * @typedef {Object} PermissionStatistics
 * @property {number} total
 * @property {number} active
 * @property {number} inactive
 */

export const PermissionStatus = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export const PermissionOrderBy = {
  NAME: "permName",
  STATUS: "permStatus",
  CREATED_AT: "permCreatedAt",
  UPDATED_AT: "permUpdatedAt",
};

export const SortOrder = {
  ASC: "asc",
  DESC: "desc",
};

/**
 * Transform raw permission data to DTO
 */
export function toPermissionDTO(perm) {
  return {
    permId: perm.permId,
    permName: perm.permName,
    permStatus: perm.permStatus,
    userCount: perm._count?.empPerms || 0,
    createdBy: perm.createdByEmp
      ? `${perm.createdByEmp.empFirstName} ${perm.createdByEmp.empLastName}`
      : null,
    createdAt: perm.permCreatedAt,
    updatedBy: perm.updatedByEmp
      ? `${perm.updatedByEmp.empFirstName} ${perm.updatedByEmp.empLastName}`
      : null,
    updatedAt: perm.permUpdatedAt,
  };
}

/**
 * Transform to simple DTO (for create/update responses)
 */
export function toSimplePermissionDTO(perm) {
  return {
    permId: perm.permId,
    permName: perm.permName,
    permStatus: perm.permStatus,
  };
}

/**
 * API Response wrapper
 */
export function createSuccessResponse(data, message = null, extra = {}) {
  return {
    success: true,
    data,
    message,
    ...extra,
  };
}

export function createErrorResponse(error, statusCode = 500) {
  return {
    success: false,
    error: error instanceof Error ? error.message : error,
    statusCode,
  };
}

export default {
  PermissionStatus,
  PermissionOrderBy,
  SortOrder,
  toPermissionDTO,
  toSimplePermissionDTO,
  createSuccessResponse,
  createErrorResponse,
};