import { getAllCatRawMaterialItems } from "@/services/warehouse/catRawMaterial.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllCatRawMaterialItems(request);
}
