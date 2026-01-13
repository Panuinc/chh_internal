import { getAllSalesOrdersOnline } from "./core/salesOrderOnline.module.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllSalesOrdersOnline(request);
}