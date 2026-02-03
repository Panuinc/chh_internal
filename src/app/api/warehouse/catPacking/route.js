import { getAllCatPackingItems } from "@/services/warehouse/catPacking.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllCatPackingItems(request);
}
