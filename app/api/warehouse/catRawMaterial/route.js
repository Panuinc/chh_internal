import { getAllCatRawMaterialItems } from "./core/catRawMaterial.module.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllCatRawMaterialItems(request);
}
