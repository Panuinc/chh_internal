import { getAllFinishedGoodsItems } from "@/features/warehouse/services";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllFinishedGoodsItems(request);
}
