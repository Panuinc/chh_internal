import { auth } from "@/lib/auth";
import PermissionController from "@/controllers/permission.controller";

/**
 * GET /api/permissions/:permId
 * ดึง permission ด้วย ID
 */
export async function GET(request, { params }) {
  const session = await auth();
  const { permId } = await params;
  return PermissionController.getById(request, session, permId);
}

/**
 * PUT /api/permissions/:permId
 * อัพเดท permission
 */
export async function PUT(request, { params }) {
  const session = await auth();
  const { permId } = await params;
  return PermissionController.update(request, session, permId);
}

/**
 * DELETE /api/permissions/:permId
 * ลบ permission
 */
export async function DELETE(request, { params }) {
  const session = await auth();
  const { permId } = await params;
  return PermissionController.delete(request, session, permId);
}