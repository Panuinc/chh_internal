import {
  getAccountById,
  updateAccount,
} from "@/features/hr/services/account.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { accountId } = await context.params;
  return getAccountById(request, String(accountId));
}

export async function PUT(request, context) {
  const { accountId } = await context.params;
  return updateAccount(request, String(accountId));
}