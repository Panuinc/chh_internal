import { auth } from "@/lib/auth";
import PermissionController from "@/controllers/permission.controller";

/**
 * GET /api/permissions
 * ดึง permissions ทั้งหมด
 */
export async function GET(request) {
  const session = await auth();
  return PermissionController.getAll(request, session);
}

/**
 * POST /api/permissions
 * สร้าง permission ใหม่
 */
export async function POST(request) {
  const session = await auth();
  return PermissionController.create(request, session);
}