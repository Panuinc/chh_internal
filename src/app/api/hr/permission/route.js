import {
  getAllPermission,
  createPermission,
} from "@/features/hr/services/permission.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllPermission(request);
}

export async function POST(request) {
  return createPermission(request);
}
