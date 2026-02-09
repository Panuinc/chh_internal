import { getAllSalesOrdersOnline } from "@/features/sales/services/salesOrderOnline.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllSalesOrdersOnline(request);
}
