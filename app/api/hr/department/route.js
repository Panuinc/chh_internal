import {
  getAllDepartment,
  createDepartment,
} from "@/app/api/hr/department/core/department.module";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllDepartment(request);
}

export async function POST(request) {
  return createDepartment(request);
}