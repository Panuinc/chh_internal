import {
  getEmployeePermissions,
} from "@/services/hr/employeeRole.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/hr/employee/[employeeId]/permission
 * Get all permissions for an employee (aggregated from all roles)
 */
export async function GET(request, { params }) {
  const { employeeId } = await params;
  return getEmployeePermissions(request, employeeId);
}
