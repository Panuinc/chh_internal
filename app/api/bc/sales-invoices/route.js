import { getAllSalesInvoices } from "./core/sales-invoice.module";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  return getAllSalesInvoices(request);
}