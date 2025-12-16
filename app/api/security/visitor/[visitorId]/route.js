import {
  getVisitorById,
  updateVisitor,
} from "@/app/api/security/visitor/core/visitor.module";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { visitorId } = await context.params;
  return getVisitorById(request, String(visitorId));
}

export async function PUT(request, context) {
  const { visitorId } = await context.params;
  return updateVisitor(request, String(visitorId));
}