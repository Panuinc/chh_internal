import { HTTP_STATUS, ERROR_MESSAGES } from "./constants";

export class AppError extends Error {
  constructor(message, status = HTTP_STATUS.INTERNAL_ERROR, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.details = details;
  }

  toJSON() {
    const result = { error: this.message };
    if (this.details) {
      result.details = this.details;
    }
    return result;
  }
}

export class ValidationError extends AppError {
  constructor(message = ERROR_MESSAGES.INVALID_INPUT, details = null) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, details);
  }
}

export class NotFoundError extends AppError {
  constructor(entity = "Resource") {
    super(ERROR_MESSAGES.notFound(entity), HTTP_STATUS.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(field, value) {
    super(ERROR_MESSAGES.duplicate(field, value), HTTP_STATUS.CONFLICT);
  }
}

export class BadRequestError extends AppError {
  constructor(message) {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

export function normalizeError(error) {
  if (error instanceof AppError) {
    return {
      status: error.status,
      message: error.message,
      details: error.details,
    };
  }

  if (error && typeof error === "object" && !Array.isArray(error)) {
    return {
      status: error.status || HTTP_STATUS.INTERNAL_ERROR,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      status: HTTP_STATUS.INTERNAL_ERROR,
      message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    };
  }

  return {
    status: HTTP_STATUS.INTERNAL_ERROR,
    message: ERROR_MESSAGES.INTERNAL_ERROR,
  };
}
