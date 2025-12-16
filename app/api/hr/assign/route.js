import { syncAssigns } from "@/app/api/hr/assign/core/assign.module";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  return syncAssigns(request);
}
