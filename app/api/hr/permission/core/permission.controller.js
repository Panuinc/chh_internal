import { NextResponse } from "next/server";
import {
  GetAllPermissionUseCase,
  GetPermissionByIdUseCase,
  CreatePermissionUseCase,
  UpdatePermissionUseCase,
} from "@/app/api/hr/permission/core/permission.usecase";
import { formatPermissionData } from "@/app/api/hr/permission/core/permission.schema";

function normalizeError(error) {
  const fallback = {
    status: 500,
    message: "Internal server error",
  };

  if (!error) return fallback;

  if (typeof error === "object" && !Array.isArray(error)) {
    const status = error.status || 500;
    const message =
      typeof error.message === "string" && error.message.trim()
        ? error.message
        : fallback.message;
    const details = error.details;
    return { status, message, details };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message || fallback.message,
    };
  }

  return fallback;
}

function buildErrorResponse(error) {
  const normalized = normalizeError(error);
  const body = {
    error: normalized.message,
  };
  if (normalized.details) {
    body.details = normalized.details;
  }

  return NextResponse.json(body, { status: normalized.status });
}

export async function getAllPermission(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "1000000", 10);

    const { permissions, total } = await GetAllPermissionUseCase(page, limit);

    return NextResponse.json({
      message: "Success",
      total,
      page,
      limit,
      permissions: formatPermissionData(permissions),
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function getPermissionById(request, permissionId) {
  try {
    const permission = await GetPermissionByIdUseCase(permissionId);
    return NextResponse.json({
      message: "Success",
      permission: formatPermissionData([permission])[0],
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function createPermission(request) {
  try {
    const data = await request.json();
    const permission = await CreatePermissionUseCase(data);
    return NextResponse.json(
      {
        message: "Created",
        permission: formatPermissionData([permission])[0],
      },
      { status: 201 }
    );
  } catch (error) {
    return buildErrorResponse(error);
  }
}

export async function updatePermission(request, permissionId) {
  try {
    const data = await request.json();
    const permission = await UpdatePermissionUseCase({ ...data, permissionId });
    return NextResponse.json({
      message: "Updated",
      permission: formatPermissionData([permission])[0],
    });
  } catch (error) {
    return buildErrorResponse(error);
  }
}
