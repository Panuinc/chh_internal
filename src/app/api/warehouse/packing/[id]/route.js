import { GetByIdPackingUseCase, formatPackingData } from "@/services/warehouse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { id } = await context.params;
  return GetByIdPackingUseCase(request, id);
}
