import { syncAssigns } from "@/services/hr/assign.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  return syncAssigns(request);
}
