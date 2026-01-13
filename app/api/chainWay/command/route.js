import { NextResponse } from "next/server";
import net from "net";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Use same env variables as config.js
const PRINTER_HOST = process.env.RFID_PRINTER_IP || process.env.NEXT_PUBLIC_RFID_PRINTER_IP || "169.254.112.200";
const PRINTER_PORT = parseInt(process.env.RFID_PRINTER_PORT || process.env.NEXT_PUBLIC_RFID_PRINTER_PORT || "9100", 10);
const TIMEOUT = 30000; // 30 seconds

/**
 * Send raw TSPL command to printer via TCP socket
 */
async function sendToPrinter(command, host = PRINTER_HOST, port = PRINTER_PORT) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let responded = false;

    const cleanup = () => {
      if (!responded) {
        responded = true;
        socket.destroy();
      }
    };

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Printer connection timeout"));
    }, TIMEOUT);

    socket.connect(port, host, () => {
      console.log(`[Printer Command] Connected to ${host}:${port}`);
      
      // Send the TSPL command
      socket.write(command + "\r\n", "utf8", (err) => {
        if (err) {
          clearTimeout(timeout);
          cleanup();
          reject(new Error(`Failed to send command: ${err.message}`));
          return;
        }

        console.log(`[Printer Command] Command sent successfully`);
        
        // Give printer time to process
        setTimeout(() => {
          clearTimeout(timeout);
          cleanup();
          resolve({ success: true, message: "Command sent successfully" });
        }, 500);
      });
    });

    socket.on("error", (err) => {
      clearTimeout(timeout);
      cleanup();
      reject(new Error(`Printer connection error: ${err.message}`));
    });

    socket.on("close", () => {
      clearTimeout(timeout);
      if (!responded) {
        responded = true;
      }
    });
  });
}

/**
 * POST /api/chainWay/command
 * Send raw TSPL command to printer
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { command, host, port } = body;

    if (!command) {
      return NextResponse.json(
        { success: false, error: "Command is required" },
        { status: 400 }
      );
    }

    console.log(`[Printer Command] Sending command (${command.length} chars)`);

    const result = await sendToPrinter(
      command,
      host || PRINTER_HOST,
      port || PRINTER_PORT
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[Printer Command] Error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send command",
      },
      { status: 500 }
    );
  }
}