import {
  getEmployeeById,
  updateEmployee,
} from "@/services/hr/employee.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { employeeId } = await context.params;
  return getEmployeeById(request, String(employeeId));
}

export async function PUT(request, context) {
  const { employeeId } = await context.params;
  return updateEmployee(request, String(employeeId));
}