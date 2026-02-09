import {
  getEmployeeRoles,
  syncEmployeeRoles,
} from "@/features/hr/services/employeeRole.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/hr/employee/[employeeId]/role
 * Get all roles assigned to an employee
 */
export async function GET(request, { params }) {
  const { employeeId } = await params;
  return getEmployeeRoles(request, employeeId);
}

/**
 * PUT /api/hr/employee/[employeeId]/role
 * Sync roles for an employee (add/remove)
 * Body: { roleIds: string[], updatedBy: string }
 */
export async function PUT(request, { params }) {
  const { employeeId } = await params;
  
  // Merge employeeId from params into the request body
  const body = await request.json();
  const requestWithEmployeeId = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: JSON.stringify({ ...body, employeeId }),
  });
  
  return syncEmployeeRoles(requestWithEmployeeId);
}
