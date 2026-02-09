import { GetNextDocumentNoUseCase } from "@/features/sales/services/memo.service";
import { successResponse, errorResponse } from "@/lib/shared/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await GetNextDocumentNoUseCase();
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
