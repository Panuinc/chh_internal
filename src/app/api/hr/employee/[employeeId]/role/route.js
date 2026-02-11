import {
  getEmployeeRoles,
  syncEmployeeRoles,
} from "@/features/hr/services/employeeRole.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { employeeId } = await params;
  return getEmployeeRoles(request, employeeId);
}

export async function PUT(request, { params }) {
  const { employeeId } = await params;

  const body = await request.json();
  const requestWithEmployeeId = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: JSON.stringify({ ...body, employeeId }),
  });

  return syncEmployeeRoles(requestWithEmployeeId);
}
