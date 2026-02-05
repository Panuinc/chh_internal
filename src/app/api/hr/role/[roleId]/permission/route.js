import {
  getRolePermissions,
  syncRolePermissions,
} from "@/services/hr/rolePermission.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/hr/role/[roleId]/permission
 * Get all permissions assigned to a role
 */
export async function GET(request, { params }) {
  const { roleId } = await params;
  return getRolePermissions(request, roleId);
}

/**
 * PUT /api/hr/role/[roleId]/permission
 * Sync permissions for a role (add/remove)
 * Body: { permissionIds: string[], updatedBy: string }
 */
export async function PUT(request, { params }) {
  const { roleId } = await params;
  
  // Merge roleId from params into the request body
  const body = await request.json();
  const requestWithRoleId = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: JSON.stringify({ ...body, roleId }),
  });
  
  return syncRolePermissions(requestWithRoleId);
}
