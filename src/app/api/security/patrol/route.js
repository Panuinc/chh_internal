import {
  getAllPatrol,
  createPatrol,
} from "@/features/security/services/patrol.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllPatrol(request);
}

export async function POST(request) {
  return createPatrol(request);
}
