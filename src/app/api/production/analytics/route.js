import { NextResponse } from "next/server";
import { bcClient, ENDPOINTS, query } from "@/lib/bc/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const fgItems = await bcClient.get(
      query()
        .filter("inventoryPostingGroupCode", "eq", "FG")
        .select(
          "id",
          "number",
          "displayName",
          "inventory",
          "blocked",
          "unitCost",
          "unitPrice",
        )
        .buildPath(ENDPOINTS.ITEMS),
    );

    const items = Array.isArray(fgItems) ? fgItems : [];

    const totalProducts = items.length;
    const inStock = items.filter((i) => i.inventory > 0).length;
    const outOfStock = items.filter((i) => i.inventory <= 0).length;
    const blocked = items.filter((i) => i.blocked).length;
    const totalInventory = items.reduce(
      (sum, i) => sum + (i.inventory || 0),
      0,
    );

    const topByInventory = [...items]
      .filter((i) => i.inventory > 0)
      .sort((a, b) => b.inventory - a.inventory)
      .slice(0, 10)
      .map((i) => ({
        name: i.displayName || i.number,
        count: i.inventory,
      }));

    return NextResponse.json({
      status: "success",
      data: {
        totalProducts,
        inStock,
        outOfStock,
        blocked,
        totalInventory,
        topByInventory,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: error.message },
      { status: 500 },
    );
  }
}
