import { NextResponse } from "next/server";
import { BCError, normalizeError } from "./errors.js";
import { HTTP_STATUS, SUCCESS_MESSAGES, PAGINATION } from "./config.js";

export function successResponse(data, meta = {}) {
  return NextResponse.json({
    success: true,
    data,
    ...(Object.keys(meta).length > 0 && { meta }),
  });
}

export function errorResponse(error, endpoint = "") {
  console.error(`[BC API] ${endpoint || "Unknown"} error:`, {
    message: error.message,
    code: error.code,
    stack: error.stack,
  });

  const normalizedError = normalizeError(error);
  return NextResponse.json(normalizedError.toJSON(), {
    status: normalizedError.statusCode,
  });
}

export function getPaginationParams(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT), 10))
  );
  return { page, limit };
}

export function parseQueryParams(searchParams, schema) {
  const result = {};

  for (const [key, config] of Object.entries(schema)) {
    const value = searchParams.get(key);

    if (value === null) {
      if (config.required) {
        const { BCValidationError } = require("./errors.js");
        throw new BCValidationError(`Query parameter '${key}' is required`, key);
      }
      result[key] = config.default ?? null;
      continue;
    }

    switch (config.type) {
      case "number":
        const num = Number(value);
        if (isNaN(num)) {
          const { BCValidationError } = require("./errors.js");
          throw new BCValidationError(`'${key}' must be a number`, key);
        }
        result[key] = num;
        break;
      case "boolean":
        result[key] = value === "true";
        break;
      default:
        result[key] = value;
    }

    if (config.validate && !config.validate(result[key])) {
      const { BCValidationError } = require("./errors.js");
      throw new BCValidationError(config.message || `Invalid value for '${key}'`, key);
    }
  }

  return result;
}

export function createLogger(useCaseName) {
  const isDebug = process.env.BC_DEBUG === "true";

  return {
    start: (data) => isDebug && console.log(`[${useCaseName}] start`, data),
    success: (data) => isDebug && console.log(`[${useCaseName}] success`, data),
    warn: (msg, data) => console.warn(`[${useCaseName}] ${msg}`, data),
    error: (data) => console.error(`[${useCaseName}] error`, data),
  };
}

export function createBCController({
  getAllUseCase,
  getByIdUseCase,
  formatData = (data) => data,
  entityKey,
  entitySingular,
}) {
  return {
    async getAll(request) {
      try {
        const { searchParams } = new URL(request.url);
        const { page, limit } = getPaginationParams(searchParams);

        const { items, total, filters } = await getAllUseCase(searchParams);

        return successResponse(
          { [entityKey]: formatData(items) },
          {
            count: items.length,
            total,
            page,
            limit,
            ...(filters && { filters }),
          }
        );
      } catch (error) {
        return errorResponse(error, `GET /${entityKey}`);
      }
    },

    async getById(request, id) {
      try {
        const item = await getByIdUseCase(id);
        return successResponse({ [entitySingular]: formatData([item])[0] });
      } catch (error) {
        return errorResponse(error, `GET /${entityKey}/${id}`);
      }
    },
  };
}