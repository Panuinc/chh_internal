import {
  getDepartmentById,
  updateDepartment,
} from "@/app/api/hr/department/core/department.module";

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