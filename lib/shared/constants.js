/**
 * Shared Constants
 * ใช้ร่วมกันทุก entity
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_ERROR: 500,
};

export const SUCCESS_MESSAGES = {
  SUCCESS: "Success",
  CREATED: "Created",
  UPDATED: "Updated",
  DELETED: "Deleted",
};

export const ERROR_MESSAGES = {
  INVALID_INPUT: "Invalid input",
  INTERNAL_ERROR: "Internal server error",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  
  // Dynamic messages
  notFound: (entity) => `${entity} not found`,
  invalidId: (entity) => `Invalid ${entity} ID`,
  duplicate: (field, value) => `${field} '${value}' already exists`,
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 1000000,
};