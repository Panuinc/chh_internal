import {
  getAllPatrol,
  createPatrol,
} from "@/app/api/security/patrol/core/patrol.module";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllPatrol(request);
}

export async function POST(request) {
  return createPatrol(request);
}