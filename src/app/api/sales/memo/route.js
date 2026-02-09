import {
  getAllMemo,
  createMemo,
} from "@/features/sales/services/memo.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllMemo(request);
}

export async function POST(request) {
  return createMemo(request);
}
