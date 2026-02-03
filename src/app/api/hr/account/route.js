import {
  getAllAccount,
  createAccount,
} from "@/services/hr/account.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllAccount(request);
}

export async function POST(request) {
  return createAccount(request);
}