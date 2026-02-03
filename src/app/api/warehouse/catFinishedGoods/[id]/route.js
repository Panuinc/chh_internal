import { getCatFinishedGoodsItemById } from "@/services/warehouse/catFinishedGoods.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { id } = await context.params;
  return getCatFinishedGoodsItemById(request, id);
}
