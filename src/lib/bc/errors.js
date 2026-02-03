import { ERROR_CODES, HTTP_STATUS } from "./config.js";

export class BCError extends Error {
  constructor(message, code, statusCode = 500, details = null) {
    super(message);
    this.name = "BCError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      ...(this.details && { details: this.details }),
      timestamp: this.timestamp,
    };
  }
}

export class BCAuthError extends BCError {
  constructor(message = "Authentication failed", details = null) {
    super(message, ERROR_CODES.AUTH_FAILED, HTTP_STATUS.UNAUTHORIZED, details);
    this.name = "BCAuthError";
  }
}

export class BCNotFoundError extends BCError {
  constructor(entityName, identifier = null) {
    const message = identifier
      ? `${entityName} with identifier '${identifier}' not found`
      : `${entityName} not found`;
    super(message, ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, {
      entityName,
      identifier,
    });
    this.name = "BCNotFoundError";
  }
}

export class BCValidationError extends BCError {
  constructor(message, field = null) {
    super(message, ERROR_CODES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, {
      field,
    });
    this.name = "BCValidationError";
  }
}

export class BCApiError extends BCError {
  constructor(message, statusCode = HTTP_STATUS.BAD_GATEWAY, responseBody = null) {
    super(message, ERROR_CODES.API_ERROR, statusCode, { responseBody });
    this.name = "BCApiError";
  }
}

export function normalizeError(error) {
  if (error instanceof BCError) return error;
  return new BCError(
    error.message || "An unexpected error occurred",
    ERROR_CODES.INTERNAL_ERROR,
    HTTP_STATUS.INTERNAL_ERROR
  );
}