import { getAssignsByEmployee } from "@/services/hr/assign.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { employeeId } = await context.params;
  return getAssignsByEmployee(request, String(employeeId));
}
