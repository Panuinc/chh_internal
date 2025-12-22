import { getAllCatPackingItems } from "./core/catPacking.module";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllCatPackingItems(request);
}