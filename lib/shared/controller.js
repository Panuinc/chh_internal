import { NextResponse } from "next/server";
import { normalizeError } from "./errors";
import { HTTP_STATUS, SUCCESS_MESSAGES, PAGINATION } from "./constants";

export function successResponse(data, status = HTTP_STATUS.OK) {
  return NextResponse.json(data, { status });
}

export function errorResponse(error) {
  const { status, message, details } = normalizeError(error);
  const body = { error: message };

  if (details) {
    body.details = details;
  }

  return NextResponse.json(body, { status });
}

export function getPaginationParams(request) {
  const { searchParams } = new URL(request.url);
  return {
    page: parseInt(
      searchParams.get("page") || String(PAGINATION.DEFAULT_PAGE),
      10
    ),
    limit: parseInt(
      searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT),
      10
    ),
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
}) {
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
          data: formatData(items),
        });
      } catch (error) {
        return errorResponse(error);
      }
    },

    async getById(request, id) {
      try {
        const item = await getByIdUseCase(id);

        return successResponse({
          message: SUCCESS_MESSAGES.SUCCESS,
          data: formatData([item])[0],
        });
      } catch (error) {
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
            data: formatData([item])[0],
          },
          HTTP_STATUS.CREATED
        );
      } catch (error) {
        return errorResponse(error);
      }
    },

    async update(request, id) {
      try {
        const data = await request.json();
        const item = await updateUseCase({ ...data, id });

        return successResponse({
          message: SUCCESS_MESSAGES.UPDATED,
          data: formatData([item])[0],
        });
      } catch (error) {
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
        return errorResponse(error);
      }
    },
  };
}
