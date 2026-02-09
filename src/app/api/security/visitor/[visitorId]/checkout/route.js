import { checkoutVisitor } from "@/features/security/services/visitor.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request, context) {
  const { visitorId } = await context.params;
  return checkoutVisitor(request, String(visitorId));
}
