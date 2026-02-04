import {
  getEmployeeById,
  updateEmployee,
} from "@/services/hr/employee.service";
import { withRateLimit } from "@/lib/rateLimiter";
import { withSanitization } from "@/lib/sanitize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getHandler(request, context) {
  const { employeeId } = await context.params;
  return getEmployeeById(request, String(employeeId));
}

async function putHandler(request, context) {
  const { employeeId } = await context.params;
  return updateEmployee(request, String(employeeId));
}

export const GET = withRateLimit(getHandler, { type: 'general' });
export const PUT = withRateLimit(withSanitization(putHandler), { type: 'general' });
