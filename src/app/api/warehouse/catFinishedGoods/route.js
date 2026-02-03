import { getAllCatFinishedGoodsItems } from "@/services/warehouse/catFinishedGoods.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllCatFinishedGoodsItems(request);
}
