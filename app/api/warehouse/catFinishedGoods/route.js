import { getAllCatFinishedGoodsItems } from "./core/catFinishedGoods.module.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllCatFinishedGoodsItems(request);
}
