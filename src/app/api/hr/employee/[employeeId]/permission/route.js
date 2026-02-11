import { getEmployeePermissions } from "@/features/hr/services/employeeRole.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, { params }) {
  const { employeeId } = await params;
  return getEmployeePermissions(request, employeeId);
}
