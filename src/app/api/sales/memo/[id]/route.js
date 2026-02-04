import {
  getMemoById,
  updateMemo,
  DeleteUseCase,
} from "@/services/sales/memo.service";
import { successResponse } from "@/lib/shared/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { id } = await context.params;
  return getMemoById(request, String(id));
}

export async function PUT(request, context) {
  const { id } = await context.params;
  return updateMemo(request, String(id));
}

export async function DELETE(request, context) {
  const { id } = await context.params;
  const result = await DeleteUseCase(String(id));
  return successResponse(result);
}
