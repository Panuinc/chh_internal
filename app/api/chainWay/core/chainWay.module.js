import { NextResponse } from "next/server";
import {
  RFIDPrinter,
  PRINTER_CONFIG,
  TIMEOUTS,
  PrintService,
  PrinterService,
  generateAllPackingSlips,
} from "@/lib/chainWay/server";

const ACTIONS = {
  COMMAND: "command",
  PACKING_SLIP: "packingSlip",
  PRINT: "print",
  PRINTER: "printer",
  PREVIEW: "preview",
  STATUS: "status",
};

const PRINTER_ACTIONS = [
  "test",
  "calibrate",
  "reset",
  "fullReset",
  "cancel",
  "feed",
  "pause",
  "resume",
];

function jsonResponse(data, status = 200) {
  return NextResponse.json(data, { status });
}

function errorResponse(message, code = "ERROR", status = 500) {
  return jsonResponse({ success: false, error: message, code }, status);
}

function validationError(message) {
  return errorResponse(message, "VALIDATION_ERROR", 400);
}

export const CommandService = {
  async send({ command, host, port }) {
    const printer = new RFIDPrinter({
      host: host || PRINTER_CONFIG.host,
      port: port || PRINTER_CONFIG.port,
      timeout: TIMEOUTS.command,
    });

    try {
      const result = await printer.sendWithRetry(command + "\r\n");
      return { success: true, data: result };
    } finally {
      printer.closeAllConnections();
    }
  },
};

export const PackingSlipService = {
  async generate(order) {
    const labels = await generateAllPackingSlips(order);
    return { labels, count: labels.length };
  },
};

export const ChainWayPrintService = {
  async printBatch(items, options = {}) {
    const result = await PrintService.printBatch(items, {
      type: options.type || "barcode",
      enableRFID: options.enableRFID === true,
      delay: options.delay || 100,
      quantity: options.quantity || 1,
      labelSize: options.labelSize,
      epcMode: options.epcMode,
      epcPrefix: options.epcPrefix,
    });

    return {
      success: result.success,
      summary: result.summary,
      results: result.results.map((r) => ({
        itemNumber: r.item?.number,
        epc: r.item?.epc,
        success: r.success,
        error: r.error,
      })),
      meta: {
        timestamp: new Date().toISOString(),
        type: options.type || "barcode",
        enableRFID: options.enableRFID === true,
      },
    };
  },

  async preview(item, options = {}) {
    const preview = await PrintService.preview(item, {
      type: options.type || "barcode",
      enableRFID: options.enableRFID === true,
    });

    return {
      zpl: preview.zpl,
      epc: preview.epc,
      epcParsed: preview.epcParsed,
      item: preview.item,
      type: preview.type,
      enableRFID: preview.enableRFID,
    };
  },
};

export const ChainWayPrinterService = {
  async getStatus(config) {
    const printerConfig = {
      host: config.host || PRINTER_CONFIG.host,
      port: parseInt(config.port || PRINTER_CONFIG.port.toString(), 10),
    };

    const connection = await PrinterService.testConnection(printerConfig);
    let status = null;

    if (connection.success) {
      status = await PrinterService.getStatus(printerConfig);
    }

    return {
      connection,
      status,
      config: printerConfig,
    };
  },

  async executeAction(action, config = {}) {
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

    if (!actionMap[action]) {
      return { error: `Unknown action: ${action}`, validActions: PRINTER_ACTIONS };
    }

    const result = await actionMap[action]();
    return { action, result };
  },
};

export async function handleCommand(request) {
  try {
    const body = await request.json();
    const { command, host, port } = body;

    if (!command) {
      return validationError("Command is required");
    }

    console.log(`[Printer Command] Sending command (${command.length} chars)`);
    const result = await CommandService.send({ command, host, port });

    return jsonResponse(result);
  } catch (error) {
    console.error("[Printer Command] Error:", error);
    return errorResponse(error.message || "Failed to send command");
  }
}

export async function handlePackingSlip(request) {
  try {
    const { order } = await request.json();

    if (!order) {
      return validationError("Order is required");
    }

    const result = await PackingSlipService.generate(order);

    return jsonResponse({
      success: true,
      labels: result.labels,
      count: result.count,
    });
  } catch (error) {
    console.error("[PackingSlip API] Error:", error);
    return errorResponse(error.message || "Failed to generate labels");
  }
}

export async function handlePrint(request) {
  try {
    const body = await request.json();
    const { items, options = {} } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return validationError("Items array is required");
    }

    for (const item of items) {
      if (!item.number) {
        return validationError("Each item must have a number");
      }
    }

    const result = await ChainWayPrintService.printBatch(items, options);

    return jsonResponse({
      success: result.success,
      data: {
        summary: result.summary,
        results: result.results,
      },
      meta: result.meta,
    });
  } catch (error) {
    console.error("[RFID Print API] Error:", error);
    return errorResponse(error.message || "Internal server error", "INTERNAL_ERROR");
  }
}

export async function handlePreview(request) {
  try {
    const { searchParams } = new URL(request.url);
    const number = searchParams.get("number");
    const displayName = searchParams.get("displayName") || number;
    const displayName2 = searchParams.get("displayName2") || "";
    const type = searchParams.get("type") || "barcode";
    const enableRFID = searchParams.get("enableRFID") === "true";

    if (!number) {
      return validationError("Item number is required");
    }

    const data = await ChainWayPrintService.preview(
      { number, displayName, displayName2 },
      { type, enableRFID }
    );

    return jsonResponse({ success: true, data });
  } catch (error) {
    console.error("[RFID Print API] Preview error:", error);
    return errorResponse(error.message || "Internal server error", "INTERNAL_ERROR");
  }
}

export async function handlePrinterStatus(request) {
  try {
    const { searchParams } = new URL(request.url);
    const config = {
      host: searchParams.get("host"),
      port: searchParams.get("port"),
    };

    const data = await ChainWayPrinterService.getStatus(config);

    return jsonResponse({
      success: true,
      data,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error("[Printer API] Error:", error);
    return errorResponse(error.message || "Failed to get status", "STATUS_ERROR");
  }
}

export async function handlePrinterAction(request) {
  try {
    const body = await request.json();
    const { printerAction, config = {} } = body;

    const result = await ChainWayPrinterService.executeAction(printerAction, config);

    if (result.error) {
      return jsonResponse(
        {
          success: false,
          error: result.error,
          code: "INVALID_ACTION",
          validActions: result.validActions,
        },
        400
      );
    }

    return jsonResponse({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error("[Printer API] Action error:", error);
    return errorResponse(error.message || "Failed to execute action", "ACTION_ERROR");
  }
}

export async function getChainWay(request) {
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

export async function postChainWay(request) {
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