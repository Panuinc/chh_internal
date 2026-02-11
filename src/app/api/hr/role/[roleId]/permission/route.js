import {
  getRolePermissions,
  syncRolePermissions,
} from "@/features/hr/services/rolePermission.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { roleId } = await params;
  return getRolePermissions(request, roleId);
}

export async function PUT(request, { params }) {
  const { roleId } = await params;

  const body = await request.json();
  const requestWithRoleId = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: JSON.stringify({ ...body, roleId }),
  });

  return syncRolePermissions(requestWithRoleId);
}
