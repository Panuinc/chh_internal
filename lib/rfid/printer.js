/**
 * RFID Printer Connection
 * รองรับ TCP/IP connection สำหรับ Chainway CP30
 */

import net from 'net';

// ============================================
// Configuration
// ============================================

const DEFAULT_CONFIG = {
  host: process.env.RFID_PRINTER_IP || '192.168.1.100',
  port: parseInt(process.env.RFID_PRINTER_PORT || '9100', 10),
  timeout: parseInt(process.env.RFID_PRINTER_TIMEOUT || '10000', 10),
  retries: 3,
  retryDelay: 1000,
};

// ============================================
// Printer Class
// ============================================

export class RFIDPrinter {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Test connection
   */
  async testConnection() {
    return new Promise((resolve) => {
      const client = new net.Socket();
      const timeout = setTimeout(() => {
        client.destroy();
        resolve({ success: false, error: 'Connection timeout' });
      }, 5000);

      client.connect(this.config.port, this.config.host, () => {
        clearTimeout(timeout);
        client.destroy();
        resolve({ success: true, message: 'Connected' });
      });

      client.on('error', (err) => {
        clearTimeout(timeout);
        client.destroy();
        resolve({ success: false, error: err.message });
      });
    });
  }

  /**
   * Send ZPL command
   */
  async send(zplCommand, waitForResponse = false) {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      let responseData = '';
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
            message: waitForResponse ? 'Sent (timeout waiting for response)' : 'Sent successfully',
            response: responseData || null,
          });
        }
      }, this.config.timeout);

      client.connect(this.config.port, this.config.host, () => {
        client.write(zplCommand, 'utf8', (err) => {
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
                resolve({ success: true, message: 'Sent successfully' });
              }
            }, 500);
          }
        });
      });

      client.on('data', (data) => {
        responseData += data.toString();
        if (waitForResponse && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          cleanup();
          resolve({ success: true, message: 'Done', response: responseData });
        }
      });

      client.on('error', (err) => {
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
   * Send with retry
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
   * Get printer status
   */
  async getStatus() {
    try {
      const result = await this.send('~HS', true);
      return { online: true, raw: result.response };
    } catch (error) {
      return { online: false, error: error.message };
    }
  }

  /**
   * Calibrate
   */
  async calibrate() {
    return this.sendWithRetry('~JC', false);
  }

  /**
   * Cancel all jobs
   */
  async cancelAll() {
    return this.sendWithRetry('~JA', false);
  }

  /**
   * Reset printer
   */
  async reset() {
    return this.sendWithRetry('^XA^JUS^XZ', false);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================
// Simple Functions
// ============================================

export async function sendZPL(zplCommand, config = {}) {
  const printer = new RFIDPrinter(config);
  return printer.sendWithRetry(zplCommand, false);
}

export async function testConnection(config = {}) {
  const printer = new RFIDPrinter(config);
  return printer.testConnection();
}

export async function getPrinterStatus(config = {}) {
  const printer = new RFIDPrinter(config);
  return printer.getStatus();
}

// ============================================
// Export
// ============================================

export default { RFIDPrinter, sendZPL, testConnection, getPrinterStatus };