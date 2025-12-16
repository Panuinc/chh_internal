import {
  getAllAccount,
  createAccount,
} from "@/app/api/hr/account/core/account.module";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllAccount(request);
}

export async function POST(request) {
  return createAccount(request);
}