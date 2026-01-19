import { NextResponse } from "next/server";
import { RFIDPrinter, PRINTER_CONFIG, TIMEOUTS } from "@/lib/chainWay/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { command, host, port } = body;

    if (!command) {
      return NextResponse.json(
        { success: false, error: "Command is required" },
        { status: 400 },
      );
    }

    console.log(`[Printer Command] Sending command (${command.length} chars)`);

    const printer = new RFIDPrinter({
      host: host || PRINTER_CONFIG.host,
      port: port || PRINTER_CONFIG.port,
      timeout: TIMEOUTS.command,
    });

    try {
      const result = await printer.sendWithRetry(command + "\r\n");

      return NextResponse.json({
        success: true,
        data: result,
      });
    } finally {
      printer.closeAllConnections();
    }
  } catch (error) {
    console.error("[Printer Command] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send command",
      },
      { status: 500 },
    );
  }
}
