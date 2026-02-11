import { NextResponse } from "next/server";
import { bcClient, ENDPOINTS, query } from "@/lib/bc/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const [fgItems, rmItems, spItems, pkItems] = await Promise.all([
      bcClient.get(
        query()
          .filter("inventoryPostingGroupCode", "eq", "FG")
          .select("id", "inventory", "blocked")
          .buildPath(ENDPOINTS.ITEMS)
      ),
      bcClient.get(
        query()
          .filter("inventoryPostingGroupCode", "eq", "RM")
          .select("id", "inventory", "blocked")
          .buildPath(ENDPOINTS.ITEMS)
      ),
      bcClient.get(
        query()
          .filter("inventoryPostingGroupCode", "eq", "SP")
          .select("id", "inventory", "blocked")
          .buildPath(ENDPOINTS.ITEMS)
      ),
      bcClient.get(
        query()
          .filter("inventoryPostingGroupCode", "eq", "PK")
          .select("id", "inventory", "blocked")
          .buildPath(ENDPOINTS.ITEMS)
      ),
    ]);

    const count = (arr) => (Array.isArray(arr) ? arr.length : 0);
    const inStock = (arr) =>
      Array.isArray(arr) ? arr.filter((i) => i.inventory > 0).length : 0;
    const totalInventory = (arr) =>
      Array.isArray(arr) ? arr.reduce((sum, i) => sum + (i.inventory || 0), 0) : 0;

    const fgCount = count(fgItems);
    const rmCount = count(rmItems);
    const spCount = count(spItems);
    const pkCount = count(pkItems);

    const fgInStock = inStock(fgItems);
    const rmInStock = inStock(rmItems);
    const spInStock = inStock(spItems);
    const pkInStock = inStock(pkItems);

    const totalItems = fgCount + rmCount + spCount + pkCount;
    const totalInStockItems = fgInStock + rmInStock + spInStock + pkInStock;
    const totalUnits = totalInventory(fgItems) + totalInventory(rmItems) + totalInventory(spItems) + totalInventory(pkItems);

    return NextResponse.json({
      status: "success",
      data: {
        totalItems,
        totalInStock: totalInStockItems,
        totalUnits,
        finishedGoods: fgCount,
        finishedGoodsInStock: fgInStock,
        rawMaterials: rmCount,
        rawMaterialsInStock: rmInStock,
        supplies: spCount,
        suppliesInStock: spInStock,
        packing: pkCount,
        packingInStock: pkInStock,
        inventoryByCategory: [
          { name: "Finished Goods", count: fgCount, inStock: fgInStock },
          { name: "Raw Materials", count: rmCount, inStock: rmInStock },
          { name: "Supplies", count: spCount, inStock: spInStock },
          { name: "Packing", count: pkCount, inStock: pkInStock },
        ],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: error.message },
      { status: 500 }
    );
  }
}
