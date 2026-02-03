import {
  getAllPermission,
  createPermission,
} from "@/services/hr/permission.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllPermission(request);
}

export async function POST(request) {
  return createPermission(request);
}