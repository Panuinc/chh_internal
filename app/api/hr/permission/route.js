import {
  getAllPermission,
  createPermission,
} from "@/app/api/hr/permission/core/permission.controller";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllPermission(request);
}

export async function POST(request) {
  return createPermission(request);
}
