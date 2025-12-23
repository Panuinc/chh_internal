/**
 * RFID Printer Communication Module
 * จัดการการเชื่อมต่อและส่งคำสั่งไปยัง Zebra RFID Printer
 * 
 * แก้ไข:
 * - Proper socket cleanup
 * - Correct reset/cancel commands
 * - Connection pooling prevention
 * - Buffer clearing
 */

import net from "net";

const DEFAULT_CONFIG = {
  host: process.env.RFID_PRINTER_IP || "192.168.1.100",
  port: parseInt(process.env.RFID_PRINTER_PORT || "9100", 10),
  timeout: parseInt(process.env.RFID_PRINTER_TIMEOUT || "15000", 10),
  retries: 3,
  retryDelay: 1000,
};

/**
 * ZPL Commands Reference
 */
export const ZPL_COMMANDS = {
  // Status
  HOST_STATUS: "~HS",           // Get host status
  HOST_IDENTIFICATION: "~HI",   // Get printer info
  
  // Cancel/Clear
  CANCEL_ALL: "~JA",            // Cancel all pending jobs
  CANCEL_CURRENT: "~JX",        // Cancel current job
  CLEAR_BUFFER: "^XA^MCY^XZ",   // Clear format buffer
  
  // Reset
  RESET_PRINTER: "~JR",         // Reset printer (soft reset)
  RESET_NETWORK: "~WR",         // Reset network card
  POWER_ON_RESET: "~JP",        // Simulate power on reset
  RESTORE_DEFAULTS: "^JUF",     // Restore factory defaults (use with caution)
  
  // Calibration
  CALIBRATE_MEDIA: "~JC",       // Calibrate media length
  CALIBRATE_RIBBON: "~JB",      // Calibrate ribbon
  
  // RFID
  RFID_CALIBRATE: "^HR",        // RFID calibrate
  RFID_TEST: "^RT",             // RFID test
  
  // Misc
  FEED_LABEL: "~TA000",         // Feed one label
  PAUSE: "~PP",                 // Pause printing
  RESUME: "~PS",                // Resume printing
};

/**
 * RFID Printer Class
 */
export class RFIDPrinter {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.activeConnections = new Set();
  }

  /**
   * สร้าง socket connection ใหม่
   * @returns {net.Socket}
   */
  createSocket() {
    const socket = new net.Socket();
    socket.setKeepAlive(false);
    socket.setNoDelay(true);
    
    this.activeConnections.add(socket);
    
    socket.on('close', () => {
      this.activeConnections.delete(socket);
    });
    
    return socket;
  }

  /**
   * ปิด socket อย่างปลอดภัย
   * @param {net.Socket} socket
   */
  safeCloseSocket(socket) {
    if (!socket) return;
    
    try {
      socket.removeAllListeners();
      if (!socket.destroyed) {
        socket.destroy();
      }
    } catch (e) {
      console.error('[Printer] Socket close error:', e.message);
    }
    
    this.activeConnections.delete(socket);
  }

  /**
   * ปิด connections ทั้งหมด
   */
  closeAllConnections() {
    for (const socket of this.activeConnections) {
      this.safeCloseSocket(socket);
    }
    this.activeConnections.clear();
  }

  /**
   * ทดสอบการเชื่อมต่อ
   * @returns {Promise<Object>} ผลการทดสอบ
   */
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
      }, 5000);

      socket.connect(this.config.port, this.config.host, () => {
        clearTimeout(timeout);
        cleanup();
        resolve({ success: true, message: "Connected" });
      });

      socket.on("error", (err) => {
        clearTimeout(timeout);
        cleanup();
        resolve({ success: false, error: err.message });
      });
    });
  }

  /**
   * ส่งคำสั่ง ZPL ไปยัง printer
   * @param {string} zplCommand - คำสั่ง ZPL
   * @param {Object} options - ตัวเลือก
   * @returns {Promise<Object>} ผลการส่ง
   */
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
        // ส่งข้อมูล
        socket.write(zplCommand, "utf8", (err) => {
          if (err) {
            clearTimeout(timeoutHandle);
            cleanup();
            reject(new Error(`Send failed: ${err.message}`));
            return;
          }

          if (!waitForResponse) {
            // รอสักครู่ให้ printer ประมวลผล
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
          // รอข้อมูลเพิ่มเติมสักครู่
          setTimeout(() => {
            if (!resolved) {
              clearTimeout(timeoutHandle);
              cleanup();
              resolve({ success: true, message: "Done", response: responseData });
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
          resolve({ success: true, message: "Connection closed", response: responseData || null });
        }
      });
    });
  }

  /**
   * ส่งคำสั่งพร้อม retry
   * @param {string} zplCommand - คำสั่ง ZPL
   * @param {Object} options - ตัวเลือก
   * @returns {Promise<Object>} ผลการส่ง
   */
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

  /**
   * อ่านสถานะ printer
   * @returns {Promise<Object>} สถานะ
   */
  async getStatus() {
    try {
      const result = await this.send(ZPL_COMMANDS.HOST_STATUS, { 
        waitForResponse: true,
        timeout: 5000 
      });
      
      // Parse status response
      const status = this.parseStatusResponse(result.response);
      
      return { 
        online: true, 
        raw: result.response,
        parsed: status
      };
    } catch (error) {
      return { online: false, error: error.message };
    }
  }

  /**
   * Parse status response จาก ~HS command
   * @param {string} response
   * @returns {Object}
   */
  parseStatusResponse(response) {
    if (!response) return null;
    
    try {
      // Zebra status format varies by model
      // Basic parsing
      return {
        raw: response,
        hasError: response.includes('ERROR') || response.includes('FAULT'),
        isPaused: response.includes('PAUSED'),
        paperOut: response.includes('PAPER OUT') || response.includes('MEDIA OUT'),
        ribbonOut: response.includes('RIBBON OUT'),
      };
    } catch (e) {
      return { raw: response };
    }
  }

  /**
   * Calibrate printer
   * @returns {Promise<Object>} ผลการ calibrate
   */
  async calibrate() {
    console.log('[Printer] Starting calibration...');
    return this.sendWithRetry(ZPL_COMMANDS.CALIBRATE_MEDIA);
  }

  /**
   * ยกเลิกงานพิมพ์ทั้งหมด และ clear buffer
   * @returns {Promise<Object>} ผล
   */
  async cancelAll() {
    console.log('[Printer] Cancelling all jobs and clearing buffer...');
    
    try {
      // 1. Cancel all pending jobs
      await this.send(ZPL_COMMANDS.CANCEL_ALL, { timeout: 3000 });
      await this.delay(200);
      
      // 2. Cancel current job
      await this.send(ZPL_COMMANDS.CANCEL_CURRENT, { timeout: 3000 });
      await this.delay(200);
      
      // 3. Clear format buffer
      await this.send(ZPL_COMMANDS.CLEAR_BUFFER, { timeout: 3000 });
      await this.delay(200);
      
      return { success: true, message: "All jobs cancelled and buffer cleared" };
    } catch (error) {
      console.error('[Printer] Cancel failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reset printer (soft reset)
   * @returns {Promise<Object>} ผล
   */
  async reset() {
    console.log('[Printer] Performing soft reset...');
    
    try {
      // 1. Cancel all jobs first
      await this.cancelAll();
      await this.delay(500);
      
      // 2. Send reset command
      await this.send(ZPL_COMMANDS.RESET_PRINTER, { timeout: 5000 });
      await this.delay(2000); // รอให้ printer reset
      
      return { success: true, message: "Printer reset initiated" };
    } catch (error) {
      console.error('[Printer] Reset failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Full reset - ใช้เมื่อ soft reset ไม่ได้ผล
   * @returns {Promise<Object>} ผล
   */
  async fullReset() {
    console.log('[Printer] Performing full reset...');
    
    try {
      // 1. Close all existing connections
      this.closeAllConnections();
      await this.delay(500);
      
      // 2. Cancel all jobs
      try {
        await this.send(ZPL_COMMANDS.CANCEL_ALL, { timeout: 3000 });
      } catch (e) {
        console.warn('[Printer] Cancel failed (may be expected):', e.message);
      }
      await this.delay(300);
      
      // 3. Clear buffer
      try {
        await this.send(ZPL_COMMANDS.CLEAR_BUFFER, { timeout: 3000 });
      } catch (e) {
        console.warn('[Printer] Clear buffer failed:', e.message);
      }
      await this.delay(300);
      
      // 4. Power on reset simulation
      try {
        await this.send(ZPL_COMMANDS.POWER_ON_RESET, { timeout: 5000 });
      } catch (e) {
        // ~JP อาจไม่ได้ response กลับมา
        console.log('[Printer] Power reset sent');
      }
      await this.delay(3000); // รอให้ printer boot
      
      // 5. Test connection
      const testResult = await this.testConnection();
      
      return { 
        success: testResult.success, 
        message: testResult.success ? "Full reset completed" : "Reset sent but connection test failed",
        connectionTest: testResult
      };
    } catch (error) {
      console.error('[Printer] Full reset failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Feed one label
   * @returns {Promise<Object>}
   */
  async feedLabel() {
    return this.send(ZPL_COMMANDS.FEED_LABEL);
  }

  /**
   * Pause printing
   * @returns {Promise<Object>}
   */
  async pause() {
    return this.send(ZPL_COMMANDS.PAUSE);
  }

  /**
   * Resume printing
   * @returns {Promise<Object>}
   */
  async resume() {
    return this.send(ZPL_COMMANDS.RESUME);
  }

  /**
   * Delay helper
   * @param {number} ms - milliseconds
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ไม่ใช้ Singleton เพื่อป้องกัน connection ค้าง
// สร้าง instance ใหม่ทุกครั้ง

/**
 * สร้าง printer instance ใหม่
 * @param {Object} config - การตั้งค่า
 * @returns {RFIDPrinter} printer instance
 */
export function createPrinter(config = {}) {
  return new RFIDPrinter(config);
}

/**
 * ส่ง ZPL ไปยัง printer
 * @param {string} zplCommand - คำสั่ง ZPL
 * @param {Object} config - การตั้งค่า printer
 * @returns {Promise<Object>} ผล
 */
export async function sendZPL(zplCommand, config = {}) {
  const printer = new RFIDPrinter(config);
  try {
    return await printer.sendWithRetry(zplCommand);
  } finally {
    printer.closeAllConnections();
  }
}

/**
 * ทดสอบการเชื่อมต่อ
 * @param {Object} config - การตั้งค่า
 * @returns {Promise<Object>} ผล
 */
export async function testConnection(config = {}) {
  const printer = new RFIDPrinter(config);
  try {
    return await printer.testConnection();
  } finally {
    printer.closeAllConnections();
  }
}

/**
 * อ่านสถานะ printer
 * @param {Object} config - การตั้งค่า
 * @returns {Promise<Object>} สถานะ
 */
export async function getPrinterStatus(config = {}) {
  const printer = new RFIDPrinter(config);
  try {
    return await printer.getStatus();
  } finally {
    printer.closeAllConnections();
  }
}

// Backward compatibility - deprecated
export function getPrinter(config = {}) {
  console.warn('[Printer] getPrinter() is deprecated, use createPrinter() instead');
  return new RFIDPrinter(config);
}

export default {
  RFIDPrinter,
  ZPL_COMMANDS,
  createPrinter,
  sendZPL,
  testConnection,
  getPrinterStatus,
  getPrinter, // deprecated
};