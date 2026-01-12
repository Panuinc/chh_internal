import net from "net";
import { PRINTER_CONFIG, TIMEOUTS } from "./config.js";
import { PrinterCommands } from "./zpl.js";

export class RFIDPrinter {
  constructor(config = {}) {
    this.config = { ...PRINTER_CONFIG, ...config };
    this.activeConnections = new Set();
  }

  createSocket() {
    const socket = new net.Socket();
    socket.setKeepAlive(false);
    socket.setNoDelay(true);

    this.activeConnections.add(socket);

    socket.on("close", () => {
      this.activeConnections.delete(socket);
    });

    return socket;
  }

  safeCloseSocket(socket) {
    if (!socket) return;

    try {
      socket.removeAllListeners();
      if (!socket.destroyed) {
        socket.destroy();
      }
    } catch (e) {
      console.error("[Printer] Socket close error:", e.message);
    }

    this.activeConnections.delete(socket);
  }

  closeAllConnections() {
    for (const socket of this.activeConnections) {
      this.safeCloseSocket(socket);
    }
    this.activeConnections.clear();
  }

  async testConnection() {
    return new Promise((resolve) => {
      const socket = this.createSocket();
      let resolved = false;

      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          this.safeCloseSocket(socket);
        }
      };

      const timeout = setTimeout(() => {
        cleanup();
        resolve({ success: false, error: "Connection timeout" });
      }, TIMEOUTS.connection);

      socket.connect(this.config.port, this.config.host, () => {
        clearTimeout(timeout);
        cleanup();
        resolve({
          success: true,
          message: "Connected",
          host: this.config.host,
          port: this.config.port,
        });
      });

      socket.on("error", (err) => {
        clearTimeout(timeout);
        cleanup();
        resolve({ success: false, error: err.message });
      });
    });
  }

  async send(zplCommand, options = {}) {
    const { waitForResponse = false, timeout = this.config.timeout } = options;

    return new Promise((resolve, reject) => {
      const socket = this.createSocket();
      let responseData = "";
      let resolved = false;

      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          this.safeCloseSocket(socket);
        }
      };

      const timeoutHandle = setTimeout(() => {
        cleanup();
        if (waitForResponse) {
          resolve({
            success: true,
            message: "Sent (timeout waiting for response)",
            response: responseData || null,
          });
        } else {
          resolve({ success: true, message: "Sent (timeout)" });
        }
      }, timeout);

      socket.connect(this.config.port, this.config.host, () => {
        socket.write(zplCommand, "utf8", (err) => {
          if (err) {
            clearTimeout(timeoutHandle);
            cleanup();
            reject(new Error(`Send failed: ${err.message}`));
            return;
          }

          if (!waitForResponse) {
            setTimeout(() => {
              clearTimeout(timeoutHandle);
              cleanup();
              resolve({ success: true, message: "Sent successfully" });
            }, 300);
          }
        });
      });

      socket.on("data", (data) => {
        responseData += data.toString();

        if (waitForResponse && !resolved) {
          setTimeout(() => {
            if (!resolved) {
              clearTimeout(timeoutHandle);
              cleanup();
              resolve({
                success: true,
                message: "Done",
                response: responseData,
              });
            }
          }, 200);
        }
      });

      socket.on("error", (err) => {
        clearTimeout(timeoutHandle);
        cleanup();
        reject(new Error(`Connection error: ${err.message}`));
      });

      socket.on("close", () => {
        clearTimeout(timeoutHandle);
        if (!resolved) {
          resolved = true;
          resolve({
            success: true,
            message: "Connection closed",
            response: responseData || null,
          });
        }
      });
    });
  }

  async sendWithRetry(zplCommand, options = {}) {
    let lastError;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        console.log(`[Printer] Attempt ${attempt}/${this.config.retries}`);
        return await this.send(zplCommand, options);
      } catch (error) {
        lastError = error;
        console.warn(`[Printer] Attempt ${attempt} failed:`, error.message);

        if (attempt < this.config.retries) {
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  async getStatus() {
    try {
      const result = await this.send(PrinterCommands.HOST_STATUS, {
        waitForResponse: true,
        timeout: TIMEOUTS.connection,
      });

      const status = this.parseStatusResponse(result.response);

      return {
        online: true,
        raw: result.response,
        parsed: status,
      };
    } catch (error) {
      return { online: false, error: error.message };
    }
  }

  parseStatusResponse(response) {
    if (!response) return null;

    try {
      return {
        raw: response,
        hasError: response.includes("ERROR") || response.includes("FAULT"),
        isPaused: response.includes("PAUSED"),
        paperOut:
          response.includes("PAPER OUT") || response.includes("MEDIA OUT"),
        ribbonOut: response.includes("RIBBON OUT"),
      };
    } catch (e) {
      return { raw: response };
    }
  }

  async calibrate() {
    console.log("[Printer] Starting calibration...");
    return this.sendWithRetry(PrinterCommands.CALIBRATE_MEDIA);
  }

  async cancelAll() {
    console.log("[Printer] Cancelling all jobs and clearing buffer...");

    try {
      await this.send(PrinterCommands.CANCEL_ALL, { timeout: 3000 });
      await this.delay(200);

      await this.send(PrinterCommands.CANCEL_CURRENT, { timeout: 3000 });
      await this.delay(200);

      await this.send(PrinterCommands.CLEAR_BUFFER, { timeout: 3000 });
      await this.delay(200);

      return {
        success: true,
        message: "All jobs cancelled and buffer cleared",
      };
    } catch (error) {
      console.error("[Printer] Cancel failed:", error);
      return { success: false, error: error.message };
    }
  }

  async reset() {
    console.log("[Printer] Performing soft reset...");

    try {
      await this.cancelAll();
      await this.delay(500);

      await this.send(PrinterCommands.RESET_PRINTER, { timeout: 5000 });
      await this.delay(2000);

      return { success: true, message: "Printer reset initiated" };
    } catch (error) {
      console.error("[Printer] Reset failed:", error);
      return { success: false, error: error.message };
    }
  }

  async fullReset() {
    console.log("[Printer] Performing full reset...");

    try {
      this.closeAllConnections();
      await this.delay(500);

      try {
        await this.send(PrinterCommands.CANCEL_ALL, { timeout: 3000 });
      } catch (e) {
        console.warn("[Printer] Cancel failed (may be expected):", e.message);
      }
      await this.delay(300);

      try {
        await this.send(PrinterCommands.CLEAR_BUFFER, { timeout: 3000 });
      } catch (e) {
        console.warn("[Printer] Clear buffer failed:", e.message);
      }
      await this.delay(300);

      try {
        await this.send(PrinterCommands.POWER_ON_RESET, { timeout: 5000 });
      } catch (e) {
        console.log("[Printer] Power reset sent");
      }
      await this.delay(3000);

      const testResult = await this.testConnection();

      return {
        success: testResult.success,
        message: testResult.success
          ? "Full reset completed"
          : "Reset sent but connection test failed",
        connectionTest: testResult,
      };
    } catch (error) {
      console.error("[Printer] Full reset failed:", error);
      return { success: false, error: error.message };
    }
  }

  async feedLabel() {
    return this.send(PrinterCommands.FEED_LABEL);
  }

  async pause() {
    return this.send(PrinterCommands.PAUSE);
  }

  async resume() {
    return this.send(PrinterCommands.RESUME);
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export function createPrinter(config = {}) {
  return new RFIDPrinter(config);
}

export async function sendZPL(zplCommand, config = {}) {
  const printer = new RFIDPrinter(config);
  try {
    return await printer.sendWithRetry(zplCommand);
  } finally {
    printer.closeAllConnections();
  }
}

export async function testConnection(config = {}) {
  const printer = new RFIDPrinter(config);
  try {
    return await printer.testConnection();
  } finally {
    printer.closeAllConnections();
  }
}

export async function getPrinterStatus(config = {}) {
  const printer = new RFIDPrinter(config);
  try {
    return await printer.getStatus();
  } finally {
    printer.closeAllConnections();
  }
}

export default {
  RFIDPrinter,
  createPrinter,
  sendZPL,
  testConnection,
  getPrinterStatus,
};
