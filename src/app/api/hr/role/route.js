import {
  getAllRole,
  createRole,
} from "@/services/hr/role.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllRole(request);
}

export async function POST(request) {
  return createRole(request);
}
