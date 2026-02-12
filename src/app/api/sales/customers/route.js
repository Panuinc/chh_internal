import { NextResponse } from "next/server";
import { bcClient } from "@/lib/bc/server";
import { createLogger } from "@/lib/logger.node";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const cache = { data: null, timestamp: 0, ttl: 5 * 60 * 1000 };

export async function GET() {
  const log = createLogger("GetCustomersOnline");

  try {
    const now = Date.now();

    if (cache.data && now - cache.timestamp < cache.ttl) {
      log.success({ source: "cache", count: cache.data.length });
      return NextResponse.json({
        success: true,
        data: cache.data,
        meta: { total: cache.data.length, source: "cache" },
      });
    }

    log.start({ endpoint: "CustomerList", filter: "ONLINE" });

    const url =
      "/ODataV4/CustomerList?$filter=Salesperson_Code eq 'ONLINE'&$select=No,Name,Contact";

    const result = await bcClient.get(url);
    const items = Array.isArray(result) ? result : result?.value || [];

    const customers = items.map((item) => ({
      no: item.No || "",
      name: item.Name || "",
      contact: item.Contact || "",
    }));

    cache.data = customers;
    cache.timestamp = now;

    log.success({ source: "api", count: customers.length });

    return NextResponse.json({
      success: true,
      data: customers,
      meta: { total: customers.length, source: "api" },
    });
  } catch (error) {
    log.error({ message: error.message });

    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch customers" },
      { status: 500 },
    );
  }
}
