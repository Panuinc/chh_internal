import { getAssignsByEmployee } from "@/app/api/hr/assign/core/assign.module";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { employeeId } = await context.params;
  return getAssignsByEmployee(request, String(employeeId));
}
