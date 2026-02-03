import { getAllCatSupplyItems } from "@/services/warehouse/catSupply.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllCatSupplyItems(request);
}
