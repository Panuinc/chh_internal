import { getCatSupplyItemById } from "@/services/warehouse/catSupply.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { id } = await context.params;
  return getCatSupplyItemById(request, id);
}
