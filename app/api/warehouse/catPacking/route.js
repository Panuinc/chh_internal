/**
 * Cat Packing API - List All
 */

import { getAllCatPackingItems } from "./core/catPacking.module.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllCatPackingItems(request);
}
