import {
  getRoleById,
  updateRole,
} from "@/services/hr/role.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { roleId } = await context.params;
  return getRoleById(request, String(roleId));
}

export async function PUT(request, context) {
  const { roleId } = await context.params;
  return updateRole(request, String(roleId));
}
