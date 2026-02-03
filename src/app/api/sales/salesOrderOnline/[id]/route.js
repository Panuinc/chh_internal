import { getSalesOrderOnlineById } from "@/services/sales/salesOrderOnline.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { id } = await context.params;
  return getSalesOrderOnlineById(request, id);
}
