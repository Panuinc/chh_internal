import { PrinterService } from "@/lib/chainWay";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const config = {
      host: searchParams.get("host") || process.env.RFID_PRINTER_IP,
      port: parseInt(
        searchParams.get("port") || process.env.RFID_PRINTER_PORT || "9100",
        10
      ),
    };

    const connection = await PrinterService.testConnection(config);

    let status = null;
    if (connection.success) {
      status = await PrinterService.getStatus(config);
    }

    return Response.json({
      success: true,
      data: {
        connection,
        status,
        config: {
          host: config.host,
          port: config.port,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Printer API] Error:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Failed to get status",
        code: "STATUS_ERROR",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, config = {} } = body;

    const printerConfig = {
      host: config.host || process.env.RFID_PRINTER_IP,
      port:
        config.port || parseInt(process.env.RFID_PRINTER_PORT || "9100", 10),
    };

    let result;

    switch (action) {
      case "test":
        result = await PrinterService.testConnection(printerConfig);
        break;

      case "calibrate":
        result = await PrinterService.calibrate(printerConfig);
        break;

      case "reset":
        result = await PrinterService.reset(printerConfig);
        break;

      case "fullReset":
        result = await PrinterService.fullReset(printerConfig);
        break;

      case "cancel":
        result = await PrinterService.cancelAll(printerConfig);
        break;

      case "feed":
        result = await PrinterService.feedLabel(printerConfig);
        break;

      case "pause":
        result = await PrinterService.pause(printerConfig);
        break;

      case "resume":
        result = await PrinterService.resume(printerConfig);
        break;

      default:
        return Response.json(
          {
            success: false,
            error: `Unknown action: ${action}`,
            code: "INVALID_ACTION",
            validActions: [
              "test",
              "calibrate",
              "reset",
              "fullReset",
              "cancel",
              "feed",
              "pause",
              "resume",
            ],
          },
          { status: 400 }
        );
    }

    return Response.json({
      success: true,
      data: {
        action,
        result,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[Printer API] Action error:", error);
    return Response.json(
      {
        success: false,
        error: error.message || "Failed to execute action",
        code: "ACTION_ERROR",
      },
      { status: 500 }
    );
  }
}
