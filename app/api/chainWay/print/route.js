import { PrintService, EPCService } from "@/lib/rfid";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, options = {} } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Items array is required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.number) {
        return Response.json(
          {
            success: false,
            error: "Each item must have a number",
            code: "VALIDATION_ERROR",
          },
          { status: 400 }
        );
      }
    }

    const result = await PrintService.printBatch(items, {
      type: options.type || "barcode",
      enableRFID: options.enableRFID === true,
      delay: options.delay || 100,
      quantity: options.quantity || 1,
      labelSize: options.labelSize,
      epcMode: options.epcMode,
      epcPrefix: options.epcPrefix,
    });

    return Response.json({
      success: result.success,
      data: {
        summary: result.summary,
        results: result.results.map((r) => ({
          itemNumber: r.item?.number,
          epc: r.item?.epc,
          success: r.success,
          error: r.error,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
        type: options.type || "barcode",
        enableRFID: options.enableRFID === true,
      },
    });
  } catch (error) {
    console.error("[RFID Print API] Error:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const number = searchParams.get("number");
    const displayName = searchParams.get("displayName") || number;
    const displayName2 = searchParams.get("displayName2") || "";
    const type = searchParams.get("type") || "barcode";
    const enableRFID = searchParams.get("enableRFID") === "true";

    if (!number) {
      return Response.json(
        {
          success: false,
          error: "Item number is required",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const preview = await PrintService.preview(
      { number, displayName, displayName2 },
      { type, enableRFID }
    );

    return Response.json({
      success: true,
      data: {
        zpl: preview.zpl,
        epc: preview.epc,
        epcParsed: preview.epcParsed,
        item: preview.item,
        type: preview.type,
        enableRFID: preview.enableRFID,
      },
    });
  } catch (error) {
    console.error("[RFID Print API] Preview error:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
