import { ApproveUseCase } from "@/services/sales/memo.service";
import { successResponse, createLogger } from "@/lib/shared/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request, context) {
  const log = createLogger("MemoApproveAPI");
  const { id } = await context.params;
  
  try {
    // Get session to check permissions
    const session = await auth();
    if (!session?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const userPermissions = session.user.permissions || [];
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      // Empty body is fine
      body = {};
    }

    const result = await ApproveUseCase(
      {
        memoId: id,
        employeeId: session.user.id,
        employeeName: session.user.name,
        ...body,
      },
      userPermissions
    );

    return successResponse({ memo: result, message: "Approved successfully" });
  } catch (error) {
    log.error({ error: error.message });
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
