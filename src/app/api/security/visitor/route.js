import {
  getAllVisitor,
  createVisitor,
} from "@/features/security/services/visitor.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllVisitor(request);
}

export async function POST(request) {
  return createVisitor(request);
}
