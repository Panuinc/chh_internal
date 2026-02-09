import { getPackingItemById } from "@/features/warehouse/services";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { id } = await context.params;
  return getPackingItemById(request, id);
}
