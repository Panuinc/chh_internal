import { getAllCatSupplyItems } from "./core/catSupply.module.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllCatSupplyItems(request);
}
