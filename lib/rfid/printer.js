/**
 * RFID Printer Communication Module
 * จัดการการเชื่อมต่อและส่งคำสั่งไปยัง Zebra RFID Printer
 */

import net from "net";

const DEFAULT_CONFIG = {
  host: process.env.RFID_PRINTER_IP || "192.168.1.100",
  port: parseInt(process.env.RFID_PRINTER_PORT || "9100", 10),
  timeout: parseInt(process.env.RFID_PRINTER_TIMEOUT || "10000", 10),
  retries: 3,
  retryDelay: 1000,
};

/**
 * RFID Printer Class
 */
export class RFIDPrinter {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * ทดสอบการเชื่อมต่อ
   * @returns {Promise<Object>} ผลการทดสอบ
   */
  async testConnection() {
    return new Promise((resolve) => {
      const client = new net.Socket();
      const timeout = setTimeout(() => {
        client.destroy();
        resolve({ success: false, error: "Connection timeout" });
      }, 5000);

      client.connect(this.config.port, this.config.host, () => {
        clearTimeout(timeout);
        client.destroy();
        resolve({ success: true, message: "Connected" });
      });

      client.on("error", (err) => {
        clearTimeout(timeout);
        client.destroy();
        resolve({ success: false, error: err.message });
      });
    });
  }

  /**
   * ส่งคำสั่ง ZPL ไปยัง printer
   * @param {string} zplCommand - คำสั่ง ZPL
   * @param {boolean} waitForResponse - รอ response หรือไม่
   * @returns {Promise<Object>} ผลการส่ง
   */
  async send(zplCommand, waitForResponse = false) {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      let responseData = "";
      let resolved = false;

      const cleanup = () => {
        if (!client.destroyed) client.destroy();
      };

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve({
            success: true,
            message: waitForResponse ? "Sent (timeout waiting for response)" : "Sent successfully",
            response: responseData || null,
          });
        }
      }, this.config.timeout);

      client.connect(this.config.port, this.config.host, () => {
        client.write(zplCommand, "utf8", (err) => {
          if (err) {
            clearTimeout(timeout);
            resolved = true;
            cleanup();
            reject(new Error(`Send failed: ${err.message}`));
            return;
          }

          if (!waitForResponse) {
            setTimeout(() => {
              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                cleanup();
                resolve({ success: true, message: "Sent successfully" });
              }
            }, 500);
          }
        });
      });

      client.on("data", (data) => {
        responseData += data.toString();
        if (waitForResponse && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          cleanup();
          resolve({ success: true, message: "Done", response: responseData });
        }
      });

      client.on("error", (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          cleanup();
          reject(new Error(`Connection error: ${err.message}`));
        }
      });
    });
  }

  /**
   * ส่งคำสั่งพร้อม retry
   * @param {string} zplCommand - คำสั่ง ZPL
   * @param {boolean} waitForResponse - รอ response หรือไม่
   * @returns {Promise<Object>} ผลการส่ง
   */
  async sendWithRetry(zplCommand, waitForResponse = false) {
    let lastError;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        return await this.send(zplCommand, waitForResponse);
      } catch (error) {
        lastError = error;
        if (attempt < this.config.retries) {
          await this.delay(this.config.retryDelay * attempt);
        }
      }
    }

    throw lastError;
  }

  /**
   * อ่านสถานะ printer
   * @returns {Promise<Object>} สถานะ
   */
  async getStatus() {
    try {
      const result = await this.send("~HS", true);
      return { online: true, raw: result.response };
    } catch (error) {
      return { online: false, error: error.message };
    }
  }

  /**
   * Calibrate printer
   * @returns {Promise<Object>} ผลการ calibrate
   */
  async calibrate() {
    return this.sendWithRetry("~JC", false);
  }

  /**
   * ยกเลิกงานพิมพ์ทั้งหมด
   * @returns {Promise<Object>} ผล
   */
  async cancelAll() {
    return this.sendWithRetry("~JA", false);
  }

  /**
   * Reset printer
   * @returns {Promise<Object>} ผล
   */
  async reset() {
    return this.sendWithRetry("^XA^JUS^XZ", false);
  }

  /**
   * Delay helper
   * @param {number} ms - milliseconds
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
let printerInstance = null;

/**
 * รับ printer instance
 * @param {Object} config - การตั้งค่า
 * @returns {RFIDPrinter} printer instance
 */
export function getPrinter(config = {}) {
  if (!printerInstance || Object.keys(config).length > 0) {
    printerInstance = new RFIDPrinter(config);
  }
  return printerInstance;
}

/**
 * ส่ง ZPL ไปยัง printer
 * @param {string} zplCommand - คำสั่ง ZPL
 * @param {Object} config - การตั้งค่า printer
 * @returns {Promise<Object>} ผล
 */
export async function sendZPL(zplCommand, config = {}) {
  const printer = new RFIDPrinter(config);
  return printer.sendWithRetry(zplCommand, false);
}

/**
 * ทดสอบการเชื่อมต่อ
 * @param {Object} config - การตั้งค่า
 * @returns {Promise<Object>} ผล
 */
export async function testConnection(config = {}) {
  const printer = new RFIDPrinter(config);
  return printer.testConnection();
}

/**
 * อ่านสถานะ printer
 * @param {Object} config - การตั้งค่า
 * @returns {Promise<Object>} สถานะ
 */
export async function getPrinterStatus(config = {}) {
  const printer = new RFIDPrinter(config);
  return printer.getStatus();
}

export default {
  RFIDPrinter,
  getPrinter,
  sendZPL,
  testConnection,
  getPrinterStatus,
};
