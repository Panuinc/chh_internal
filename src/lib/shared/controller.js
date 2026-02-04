import { NextResponse } from "next/server";
import { normalizeError } from "./errors";
import { HTTP_STATUS, SUCCESS_MESSAGES, PAGINATION } from "./constants";
import { createLogger } from "./logger";

export function successResponse(data, status = HTTP_STATUS.OK) {
  return NextResponse.json(data, { status });
}

export function errorResponse(error) {
  const { statusCode, message, details } = normalizeError(error);
  const body = { error: message };

  if (details) {
    body.details = details;
  }

  return NextResponse.json(body, { status: statusCode });
}

export function getPaginationParams(request) {
  const { searchParams } = new URL(request.url);
  const rawLimit = parseInt(
    searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT),
    10,
  );
  return {
    page: Math.max(
      1,
      parseInt(searchParams.get("page") || String(PAGINATION.DEFAULT_PAGE), 10),
    ),
    limit: Math.min(PAGINATION.MAX_LIMIT, Math.max(1, rawLimit)),
  };
}

export function calculateSkip(page, limit) {
  return (page - 1) * limit;
}

export function createBaseController({
  getAllUseCase,
  getByIdUseCase,
  createUseCase,
  updateUseCase,
  deleteUseCase,
  formatData = (data) => data,
  entityKey = "data",
  entitySingular = null,
}) {
  const singularKey = entitySingular || entityKey;
  const log = createLogger(`${entityKey}Controller`);

  return {
    async getAll(request) {
      try {
        const { page, limit } = getPaginationParams(request);
        const { items, total } = await getAllUseCase(page, limit);

        return successResponse({
          message: SUCCESS_MESSAGES.SUCCESS,
          total,
          page,
          limit,
          [entityKey]: formatData(items),
        });
      } catch (error) {
        log.error({
          method: "getAll",
          error: error.message,
          stack: error.stack,
        });
        return errorResponse(error);
      }
    },

    async getById(request, id) {
      try {
        const item = await getByIdUseCase(id);

        return successResponse({
          message: SUCCESS_MESSAGES.SUCCESS,
          [singularKey]: formatData([item])[0],
        });
      } catch (error) {
        log.error({
          method: "getById",
          id,
          error: error.message,
          stack: error.stack,
        });
        return errorResponse(error);
      }
    },

    async create(request) {
      try {
        const data = await request.json();
        const item = await createUseCase(data);

        return successResponse(
          {
            message: SUCCESS_MESSAGES.CREATED,
            [singularKey]: formatData([item])[0],
          },
          HTTP_STATUS.CREATED,
        );
      } catch (error) {
        log.error({
          method: "create",
          error: error.message,
          stack: error.stack,
        });
        return errorResponse(error);
      }
    },

    async update(request, id) {
      try {
        const data = await request.json();
        const item = await updateUseCase({ ...data, id });

        return successResponse({
          message: SUCCESS_MESSAGES.UPDATED,
          [singularKey]: formatData([item])[0],
        });
      } catch (error) {
        log.error({
          method: "update",
          id,
          error: error.message,
          stack: error.stack,
        });
        return errorResponse(error);
      }
    },

    async delete(request, id) {
      if (!deleteUseCase) {
        return errorResponse({ status: 501, message: "Not implemented" });
      }

      try {
        await deleteUseCase(id);

        return successResponse({
          message: SUCCESS_MESSAGES.DELETED,
        });
      } catch (error) {
        log.error({
          method: "delete",
          id,
          error: error.message,
          stack: error.stack,
        });
        return errorResponse(error);
      }
    },
  };
}
