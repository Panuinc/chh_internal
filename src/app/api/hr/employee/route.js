import {
  getAllEmployee,
  createEmployee,
} from "@/services/hr/employee.service";
import { withRateLimit } from "@/lib/rateLimiter";
import { withSanitization } from "@/lib/sanitize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getHandler(request) {
  return getAllEmployee(request);
}

async function postHandler(request) {
  return createEmployee(request);
}

export const GET = withRateLimit(getHandler, { type: 'general' });
export const POST = withRateLimit(withSanitization(postHandler), { type: 'general' });
