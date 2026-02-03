import {
  getPermissionById,
  updatePermission,
} from "@/services/hr/permission.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { permissionId } = await context.params;
  return getPermissionById(request, String(permissionId));
}

export async function PUT(request, context) {
  const { permissionId } = await context.params;
  return updatePermission(request, String(permissionId));
}