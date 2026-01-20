import { NextResponse } from "next/server";
import {
  RFIDPrinter,
  PRINTER_CONFIG,
  TIMEOUTS,
  PrintService,
  PrinterService,
  generateAllPackingSlips,
} from "@/lib/chainWay/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ACTIONS = {
  COMMAND: "command",
  PACKING_SLIP: "packingSlip",
  PRINT: "print",
  PRINTER: "printer",
  PREVIEW: "preview",
  STATUS: "status",
};

const PRINTER_ACTIONS = ["test", "calibrate", "reset", "fullReset", "cancel", "feed", "pause", "resume"];

function jsonResponse(data, status = 200) {
  return NextResponse.json(data, { status });
}

function errorResponse(message, code = "ERROR", status = 500) {
  return jsonResponse({ success: false, error: message, code }, status);
}

function validationError(message) {
  return errorResponse(message, "VALIDATION_ERROR", 400);
}

async function handleCommand(request) {
  try {
    const body = await request.json();
    const { command, host, port } = body;

    if (!command) return validationError("Command is required");

    const printer = new RFIDPrinter({
      host: host || PRINTER_CONFIG.host,
      port: port || PRINTER_CONFIG.port,
      timeout: TIMEOUTS.command,
    });

    try {
      const result = await printer.sendWithRetry(command + "\r\n");
      return jsonResponse({ success: true, data: result });
    } finally {
      printer.closeAllConnections();
    }
  } catch (error) {
    return errorResponse(error.message || "Failed to send command");
  }
}

async function handlePackingSlip(request) {
  try {
    const { order } = await request.json();

    if (!order) return validationError("Order is required");

    const labels = await generateAllPackingSlips(order);

    return jsonResponse({ success: true, labels, count: labels.length });
  } catch (error) {
    return errorResponse(error.message || "Failed to generate labels");
  }
}

async function handlePrint(request) {
  try {
    const body = await request.json();
    const { items, options = {} } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return validationError("Items array is required");
    }

    for (const item of items) {
      if (!item.number) return validationError("Each item must have a number");
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

    return jsonResponse({
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
    return errorResponse(error.message || "Internal server error", "INTERNAL_ERROR");
  }
}

async function handlePreview(request) {
  try {
    const { searchParams } = new URL(request.url);
    const number = searchParams.get("number");
    const displayName = searchParams.get("displayName") || number;
    const displayName2 = searchParams.get("displayName2") || "";
    const type = searchParams.get("type") || "barcode";
    const enableRFID = searchParams.get("enableRFID") === "true";

    if (!number) return validationError("Item number is required");

    const data = await PrintService.preview(
      { number, displayName, displayName2 },
      { type, enableRFID }
    );

    return jsonResponse({ success: true, data });
  } catch (error) {
    return errorResponse(error.message || "Internal server error", "INTERNAL_ERROR");
  }
}

async function handlePrinterStatus(request) {
  try {
    const { searchParams } = new URL(request.url);
    const config = {
      host: searchParams.get("host") || PRINTER_CONFIG.host,
      port: parseInt(searchParams.get("port") || String(PRINTER_CONFIG.port), 10),
    };

    const connection = await PrinterService.testConnection(config);
    let status = null;

    if (connection.success) {
      status = await PrinterService.getStatus(config);
    }

    return jsonResponse({
      success: true,
      data: { connection, status, config },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return errorResponse(error.message || "Failed to get status", "STATUS_ERROR");
  }
}

async function handlePrinterAction(request) {
  try {
    const body = await request.json();
    const { printerAction, config = {} } = body;

    const printerConfig = {
      host: config.host || PRINTER_CONFIG.host,
      port: config.port || PRINTER_CONFIG.port,
    };

    const actionMap = {
      test: () => PrinterService.testConnection(printerConfig),
      calibrate: () => PrinterService.calibrate(printerConfig),
      reset: () => PrinterService.reset(printerConfig),
      fullReset: () => PrinterService.fullReset(printerConfig),
      cancel: () => PrinterService.cancelAll(printerConfig),
      feed: () => PrinterService.feedLabel(printerConfig),
      pause: () => PrinterService.pause(printerConfig),
      resume: () => PrinterService.resume(printerConfig),
    };

    if (!actionMap[printerAction]) {
      return jsonResponse(
        {
          success: false,
          error: `Unknown action: ${printerAction}`,
          code: "INVALID_ACTION",
          validActions: PRINTER_ACTIONS,
        },
        400
      );
    }

    const result = await actionMap[printerAction]();

    return jsonResponse({
      success: true,
      data: { action: printerAction, result },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    return errorResponse(error.message || "Failed to execute action", "ACTION_ERROR");
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  switch (action) {
    case ACTIONS.PREVIEW:
      return handlePreview(request);
    case ACTIONS.STATUS:
      return handlePrinterStatus(request);
    default:
      return jsonResponse({
        success: true,
        message: "ChainWay API",
        availableActions: {
          get: [ACTIONS.PREVIEW, ACTIONS.STATUS],
          post: [ACTIONS.COMMAND, ACTIONS.PACKING_SLIP, ACTIONS.PRINT, ACTIONS.PRINTER],
        },
      });
  }
}

export async function POST(request) {
  const body = await request.clone().json();
  const { action } = body;

  switch (action) {
    case ACTIONS.COMMAND:
      return handleCommand(request);
    case ACTIONS.PACKING_SLIP:
      return handlePackingSlip(request);
    case ACTIONS.PRINT:
      return handlePrint(request);
    case ACTIONS.PRINTER:
      return handlePrinterAction(request);
    default:
      return jsonResponse(
        {
          success: false,
          error: `Unknown action: ${action}`,
          code: "INVALID_ACTION",
          validActions: [ACTIONS.COMMAND, ACTIONS.PACKING_SLIP, ACTIONS.PRINT, ACTIONS.PRINTER],
        },
        400
      );
  }
}