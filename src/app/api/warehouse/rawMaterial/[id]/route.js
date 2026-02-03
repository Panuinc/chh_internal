import { GetByIdRawMaterialUseCase, formatRawMaterialData } from "@/services/warehouse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { id } = await context.params;
  return GetByIdRawMaterialUseCase(request, id);
}
