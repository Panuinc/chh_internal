import {
  getAllDepartment,
  createDepartment,
} from "@/features/hr/services/department.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllDepartment(request);
}

export async function POST(request) {
  return createDepartment(request);
}
