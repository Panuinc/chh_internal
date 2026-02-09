import {
  getDepartmentById,
  updateDepartment,
} from "@/features/hr/services/department.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { departmentId } = await context.params;
  return getDepartmentById(request, String(departmentId));
}

export async function PUT(request, context) {
  const { departmentId } = await context.params;
  return updateDepartment(request, String(departmentId));
}