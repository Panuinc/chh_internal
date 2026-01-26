import { getCatRawMaterialItemById } from "../core/catRawMaterial.module.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { id } = await context.params;
  return getCatRawMaterialItemById(request, id);
}
