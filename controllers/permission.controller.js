import { NextResponse } from "next/server";
import PermissionService from "@/services/permission.service";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/schemas/permission.schema";
import { ValidationError } from "@/validators/permission.validator";
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "@/usecases/permission.usecase";

/**
 * Permission Controller
 * จัดการ HTTP Request/Response
 * แยก HTTP concerns ออกจาก business logic
 */
export class PermissionController {
  /**
   * Map error to HTTP status code
   */
  static getErrorStatusCode(error) {
    if (error instanceof ValidationError) return 400;
    if (error instanceof NotFoundError) return 404;
    if (error instanceof ConflictError) return 409;
    if (error instanceof ForbiddenError) return 403;
    if (error.statusCode) return error.statusCode;
    return 500;
  }

  /**
   * Handle error response
   */
  static handleError(error, context = "") {
    console.error(`Error in ${context}:`, error);

    const statusCode = this.getErrorStatusCode(error);
    const errorResponse = createErrorResponse(error, statusCode);

    return NextResponse.json(
      { success: false, error: errorResponse.error },
      { status: statusCode }
    );
  }

  /**
   * Check authentication
   */
  static checkAuth(session) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
  }

  /**
   * Check super admin permission
   */
  static checkSuperAdmin(session) {
    if (!session.user.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return null;
  }

  /**
   * GET /api/permissions
   * ดึง permissions ทั้งหมด
   */
  static async getAll(request, session) {
    // Check auth
    const authError = this.checkAuth(session);
    if (authError) return authError;

    try {
      const { searchParams } = new URL(request.url);
      const options = {
        status: searchParams.get("status") || "Active",
        orderBy: searchParams.get("orderBy") || "permName",
        order: searchParams.get("order") || "asc",
      };

      const permissions = await PermissionService.getAllPermissions(options);

      return NextResponse.json(
        createSuccessResponse(permissions, null, { count: permissions.length })
      );
    } catch (error) {
      return this.handleError(error, "getAll permissions");
    }
  }

  /**
   * GET /api/permissions/:permId
   * ดึง permission ด้วย ID
   */
  static async getById(request, session, permId) {
    // Check auth
    const authError = this.checkAuth(session);
    if (authError) return authError;

    try {
      const permission = await PermissionService.getPermissionById(permId);

      return NextResponse.json(createSuccessResponse(permission));
    } catch (error) {
      return this.handleError(error, "getById permission");
    }
  }

  /**
   * POST /api/permissions
   * สร้าง permission ใหม่
   */
  static async create(request, session) {
    // Check auth
    const authError = this.checkAuth(session);
    if (authError) return authError;

    // Check super admin
    const adminError = this.checkSuperAdmin(session);
    if (adminError) return adminError;

    try {
      const body = await request.json();

      const permission = await PermissionService.createPermission({
        permName: body.permName,
        createdBy: session.user.id,
      });

      return NextResponse.json(
        createSuccessResponse(permission, "Permission created successfully"),
        { status: 201 }
      );
    } catch (error) {
      return this.handleError(error, "create permission");
    }
  }

  /**
   * PUT /api/permissions/:permId
   * อัพเดท permission
   */
  static async update(request, session, permId) {
    // Check auth
    const authError = this.checkAuth(session);
    if (authError) return authError;

    // Check super admin
    const adminError = this.checkSuperAdmin(session);
    if (adminError) return adminError;

    try {
      const body = await request.json();

      const permission = await PermissionService.updatePermission(permId, {
        permName: body.permName,
        permStatus: body.permStatus,
        updatedBy: session.user.id,
      });

      return NextResponse.json(
        createSuccessResponse(permission, "Permission updated successfully")
      );
    } catch (error) {
      return this.handleError(error, "update permission");
    }
  }

  /**
   * DELETE /api/permissions/:permId
   * ลบ permission
   */
  static async delete(request, session, permId) {
    // Check auth
    const authError = this.checkAuth(session);
    if (authError) return authError;

    // Check super admin
    const adminError = this.checkSuperAdmin(session);
    if (adminError) return adminError;

    try {
      const result = await PermissionService.deletePermission(
        permId,
        session.user.id
      );

      return NextResponse.json(createSuccessResponse(null, result.message));
    } catch (error) {
      return this.handleError(error, "delete permission");
    }
  }

  /**
   * GET /api/permissions/stats
   * ดึงสถิติ permissions
   */
  static async getStatistics(request, session) {
    // Check auth
    const authError = this.checkAuth(session);
    if (authError) return authError;

    try {
      const stats = await PermissionService.getStatistics();

      return NextResponse.json(createSuccessResponse(stats));
    } catch (error) {
      return this.handleError(error, "get statistics");
    }
  }

  /**
   * GET /api/permissions/check/:permName
   * ตรวจสอบว่า permission มีอยู่หรือไม่
   */
  static async checkExists(request, session, permName) {
    // Check auth
    const authError = this.checkAuth(session);
    if (authError) return authError;

    try {
      const result = await PermissionService.checkPermissionExists(permName);

      return NextResponse.json(createSuccessResponse(result));
    } catch (error) {
      return this.handleError(error, "check permission exists");
    }
  }
}

export default PermissionController;