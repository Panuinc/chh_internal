import { GetAllSupplyUseCase, formatSupplyData } from "@/services/warehouse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return GetAllSupplyUseCase(request);
}
