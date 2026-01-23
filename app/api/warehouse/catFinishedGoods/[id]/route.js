import { getCatFinishedGoodsItemById } from "../core/catFinishedGoods.module.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { id } = await context.params;
  return getCatFinishedGoodsItemById(request, id);
}
