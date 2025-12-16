import {
  getAllVisitor,
  createVisitor,
} from "@/app/api/security/visitor/core/visitor.module";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllVisitor(request);
}

export async function POST(request) {
  return createVisitor(request);
}