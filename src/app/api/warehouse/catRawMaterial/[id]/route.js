import { getCatRawMaterialItemById } from "@/services/warehouse/catRawMaterial.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { id } = await context.params;
  return getCatRawMaterialItemById(request, id);
}
