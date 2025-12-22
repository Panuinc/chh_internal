import { getCatPackingItemById } from "../core/catPacking.module";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { id } = await context.params;
  return getCatPackingItemById(request, id);
}