import { NextResponse } from "next/server";
import { generateAllPackingSlips } from "@/lib/chainWay";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { order, totalPieces } = await request.json();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order is required" },
        { status: 400 },
      );
    }

    const labels = await generateAllPackingSlips(order);

    return NextResponse.json({
      success: true,
      labels,
      count: labels.length,
    });
  } catch (error) {
    console.error("[PackingSlip API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate labels" },
      { status: 500 },
    );
  }
}
