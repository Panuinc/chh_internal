import {
  getAllMemo,
  createMemo,
} from "@/services/sales/memo.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllMemo(request);
}

export async function POST(request) {
  return createMemo(request);
}
