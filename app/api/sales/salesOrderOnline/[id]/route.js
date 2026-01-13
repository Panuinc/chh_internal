import { getSalesOrderOnlineById } from "../core/salesOrderOnline.module.js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request, context) {
  const { id } = await context.params;
  return getSalesOrderOnlineById(request, id);
}