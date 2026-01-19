import { getChainWay, postChainWay } from "@/app/api/chainWay/core/chainWay.module";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getChainWay(request);
}

export async function POST(request) {
  return postChainWay(request);
}