import { ChangePasswordUseCase } from "@/features/hr/services/account.service";
import { successResponse, errorResponse } from "@/lib/shared/server";
import { createLogger } from "@/lib/logger.node";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const log = createLogger("ChangePasswordRoute");

export async function POST(request, context) {
  try {
    const { accountId } = await context.params;
    const data = await request.json();

    log.start({ accountId });

    const result = await ChangePasswordUseCase({
      ...data,
      accountId: String(accountId),
    });

    log.success({ id: result.accountId });

    return successResponse({
      message: "Password changed successfully",
      account: {
        accountId: result.accountId,
        accountUsername: result.accountUsername,
      },
    });
  } catch (error) {
    log.error({ error: error.message });
    return errorResponse(error);
  }
}
