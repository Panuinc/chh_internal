import {
  getAllEmployee,
  createEmployee,
} from "@/app/api/hr/employee/core/employee.module";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllEmployee(request);
}

export async function POST(request) {
  return createEmployee(request);
}