/**
 * RFID Print Service
 * 
 * Business logic layer สำหรับการพิมพ์ RFID tags
 * จัดการ EPC generation, validation, และ print queue
 */

import {
  generateSimpleEPC,
  generateSGTIN96,
  generateUniqueEPC,
  buildRFIDLabel,
  buildBarcodeLabel,
  buildQRCodeRFIDLabel,
  buildBatchRFIDLabels,
} from './zplBuilder.js';

import { RFIDPrinter, sendZPLToPrinter } from './printer.js';

// ============================================
// Configuration
// ============================================

const SERVICE_CONFIG = {
  // GS1 Company Prefix (ต้องขอจาก GS1 Thailand)
  companyPrefix: process.env.GS1_COMPANY_PREFIX || '0885000',
  
  // Default label size (mm) - 100mm x 80mm
  defaultLabelSize: {
    width: parseInt(process.env.LABEL_WIDTH || '100', 10),
    height: parseInt(process.env.LABEL_HEIGHT || '80', 10),
  },
  
  // EPC Generation mode
  epcMode: process.env.EPC_MODE || 'simple', // 'simple' | 'sgtin96' | 'unique'
  
  // Prefix for simple EPC
  epcPrefix: process.env.EPC_PREFIX || 'PK',
  
  // Serial number counter (in production, use database)
  serialCounter: 0,
};

// ============================================
// Logging
// ============================================

function createLogger(context) {
  return {
    start: (data) => console.log(`[${context}] Start:`, JSON.stringify(data)),
    success: (data) => console.log(`[${context}] Success:`, JSON.stringify(data)),
    error: (data) => console.error(`[${context}] Error:`, JSON.stringify(data)),
    info: (msg) => console.log(`[${context}] ${msg}`),
  };
}

// ============================================
// EPC Service
// ============================================

export const EPCService = {
  /**
   * Generate EPC based on configuration
   */
  generate(item, options = {}) {
    const mode = options.mode || SERVICE_CONFIG.epcMode;
    
    switch (mode) {
      case 'sgtin96':
        return generateSGTIN96({
          companyPrefix: options.companyPrefix || SERVICE_CONFIG.companyPrefix,
          itemRef: item.number.replace(/\D/g, '').slice(-6),
          serial: item.serial || this.getNextSerial(),
        });
        
      case 'unique':
        return generateUniqueEPC({
          prefix: options.prefix || SERVICE_CONFIG.epcPrefix,
        });
        
      case 'simple':
      default:
        return generateSimpleEPC({
          prefix: options.prefix || SERVICE_CONFIG.epcPrefix,
          itemNumber: item.number,
          sequence: item.serial || this.getNextSerial(),
        });
    }
  },
  
  /**
   * Get next serial number
   * ในการใช้งานจริง ควรใช้ database sequence
   */
  getNextSerial() {
    SERVICE_CONFIG.serialCounter++;
    return Date.now().toString().slice(-10) + 
           SERVICE_CONFIG.serialCounter.toString().padStart(4, '0');
  },
  
  /**
   * Validate EPC format
   */
  validate(epc) {
    if (!epc || typeof epc !== 'string') {
      return { valid: false, error: 'EPC is required' };
    }
    
    if (!/^[0-9A-Fa-f]+$/.test(epc)) {
      return { valid: false, error: 'EPC must be hexadecimal' };
    }
    
    if (epc.length !== 24) {
      return { valid: false, error: 'EPC must be 24 characters (96 bits)' };
    }
    
    return { valid: true };
  },
  
  /**
   * Parse EPC to readable format
   */
  parse(epc) {
    const header = epc.substring(0, 2);
    
    return {
      raw: epc,
      header,
      type: this.getEPCType(header),
      uri: `urn:epc:tag:sgtin-96:${epc}`,
    };
  },
  
  /**
   * Get EPC type from header
   */
  getEPCType(header) {
    const types = {
      '30': 'SGTIN-96',
      '31': 'SGTIN-198',
      'E2': 'Proprietary/Custom',
      '35': 'SSCC-96',
      '36': 'GRAI-96',
    };
    return types[header.toUpperCase()] || 'Unknown';
  },
};

// ============================================
// Print Service
// ============================================

export const PrintService = {
  /**
   * Print single label (with or without RFID)
   * 
   * @param {Object} item - Item to print
   * @param {Object} options - Print options
   * @param {boolean} options.enableRFID - Enable RFID encoding (default: false)
   */
  async printSingle(item, options = {}) {
    const log = createLogger('PrintService.printSingle');
    const enableRFID = options.enableRFID === true; // Default: false (no RFID)
    
    log.start({ itemNumber: item.number, enableRFID, options: { delay: options.delay } });
    
    try {
      let zpl;
      let epcData = null;
      
      if (enableRFID) {
        // Generate EPC for RFID label
        epcData = options.epc || EPCService.generate(item, options);
        
        // Validate EPC
        const validation = EPCService.validate(epcData);
        if (!validation.valid) {
          throw new Error(`Invalid EPC: ${validation.error}`);
        }
        
        // Build RFID label ZPL
        zpl = buildRFIDLabel({
          epcData,
          itemNumber: item.number,
          displayName: item.displayName || item.number,
          displayName2: item.displayName2 || '',
          barcodeData: item.barcodeData || item.number,
          quantity: options.quantity || 1,
          labelSize: options.labelSize || SERVICE_CONFIG.defaultLabelSize,
        });
      } else {
        // Build normal barcode label ZPL (no RFID)
        zpl = buildBarcodeLabel({
          itemNumber: item.number,
          displayName: item.displayName || item.number,
          displayName2: item.displayName2 || '',
          barcodeData: item.barcodeData || item.number,
          quantity: options.quantity || 1,
          labelSize: options.labelSize || SERVICE_CONFIG.defaultLabelSize,
        });
      }
      
      // Send to printer
      const result = await sendZPLToPrinter(zpl, options.printerConfig);
      
      log.success({
        itemNumber: item.number,
        epc: epcData,
        enableRFID,
        status: result.success ? 'printed' : 'failed',
      });
      
      return {
        success: true,
        item: {
          number: item.number,
          displayName: item.displayName,
          epc: epcData,
          epcParsed: epcData ? EPCService.parse(epcData) : null,
        },
        printer: result,
      };
      
    } catch (error) {
      log.error({ message: error.message });
      return {
        success: false,
        error: error.message,
        item: { number: item.number },
      };
    }
  },
  
  /**
   * Print batch of RFID tags
   */
  async printBatch(items, options = {}) {
    const log = createLogger('PrintService.printBatch');
    
    log.start({ itemCount: items.length });
    
    const results = [];
    let successCount = 0;
    let failCount = 0;
    
    for (const item of items) {
      const result = await this.printSingle(item, options);
      results.push(result);
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Small delay between prints to avoid overwhelming printer
      if (options.delay) {
        await new Promise(r => setTimeout(r, options.delay));
      }
    }
    
    log.success({ successCount, failCount, total: items.length });
    
    return {
      success: failCount === 0,
      summary: {
        total: items.length,
        success: successCount,
        failed: failCount,
      },
      results,
    };
  },
  
  /**
   * Print barcode only (no RFID)
   */
  async printBarcode(item, options = {}) {
    const log = createLogger('PrintService.printBarcode');
    
    log.start({ itemNumber: item.number });
    
    try {
      const zpl = buildBarcodeLabel({
        itemNumber: item.number,
        displayName: item.displayName || item.number,
        displayName2: item.displayName2 || '',
        barcodeData: item.barcodeData || item.number,
        quantity: options.quantity || 1,
        labelSize: options.labelSize || SERVICE_CONFIG.defaultLabelSize,
      });
      
      const result = await sendZPLToPrinter(zpl, options.printerConfig);
      
      log.success({ itemNumber: item.number });
      
      return {
        success: true,
        item: { number: item.number, displayName: item.displayName },
        printer: result,
      };
      
    } catch (error) {
      log.error({ message: error.message });
      return {
        success: false,
        error: error.message,
        item: { number: item.number },
      };
    }
  },
  
  /**
   * Print QR code with RFID
   */
  async printQRCodeRFID(item, options = {}) {
    const log = createLogger('PrintService.printQRCodeRFID');
    
    log.start({ itemNumber: item.number });
    
    try {
      const epcData = options.epc || EPCService.generate(item, options);
      
      const zpl = buildQRCodeRFIDLabel({
        epcData,
        itemNumber: item.number,
        displayName: item.displayName || item.number,
        qrData: item.qrData || item.number,
        quantity: options.quantity || 1,
        labelSize: options.labelSize || { width: 100, height: 60 },
      });
      
      const result = await sendZPLToPrinter(zpl, options.printerConfig);
      
      log.success({ itemNumber: item.number, epc: epcData });
      
      return {
        success: true,
        item: {
          number: item.number,
          displayName: item.displayName,
          epc: epcData,
        },
        printer: result,
      };
      
    } catch (error) {
      log.error({ message: error.message });
      return {
        success: false,
        error: error.message,
        item: { number: item.number },
      };
    }
  },
  
  /**
   * Preview ZPL (returns ZPL without printing)
   */
  preview(item, options = {}) {
    const epcData = options.epc || EPCService.generate(item, options);
    
    const zpl = buildRFIDLabel({
      epcData,
      itemNumber: item.number,
      displayName: item.displayName || item.number,
      displayName2: item.displayName2 || '',
      barcodeData: item.barcodeData || item.number,
      quantity: options.quantity || 1,
      labelSize: options.labelSize || SERVICE_CONFIG.defaultLabelSize,
    });
    
    return {
      zpl,
      epc: epcData,
      epcParsed: EPCService.parse(epcData),
      item,
    };
  },
};

// ============================================
// Printer Management Service
// ============================================

export const PrinterService = {
  /**
   * Test printer connection
   */
  async testConnection(config) {
    const printer = new RFIDPrinter(config);
    return printer.testConnection();
  },
  
  /**
   * Get printer status
   */
  async getStatus(config) {
    const printer = new RFIDPrinter(config);
    return printer.getStatus();
  },
  
  /**
   * Calibrate printer
   */
  async calibrate(config) {
    const printer = new RFIDPrinter(config);
    return printer.calibrate();
  },
  
  /**
   * Cancel all jobs
   */
  async cancelAll(config) {
    const printer = new RFIDPrinter(config);
    return printer.cancelAll();
  },
  
  /**
   * Reset printer
   */
  async reset(config) {
    const printer = new RFIDPrinter(config);
    return printer.reset();
  },
};

// ============================================
// Export
// ============================================

export default {
  EPCService,
  PrintService,
  PrinterService,
  SERVICE_CONFIG,
};