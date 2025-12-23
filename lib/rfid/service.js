/**
 * RFID Print Service
 * High-level API สำหรับการพิมพ์ Label ทุกประเภท
 */

import { EPCService } from './epc.js';
import { buildBarcodeLabel, buildRFIDLabel, buildQRLabel, buildThaiLabel } from './zpl.js';
import { sendZPL, RFIDPrinter } from './printer.js';

// ============================================
// Configuration
// ============================================

const CONFIG = {
  defaultLabelSize: { width: 100, height: 80 },
  epcPrefix: process.env.EPC_PREFIX || 'PK',
  companyPrefix: process.env.GS1_COMPANY_PREFIX || '0885000',
};

// ============================================
// Print Service
// ============================================

export const PrintService = {
  /**
   * พิมพ์ Label เดี่ยว
   * @param {Object} item - ข้อมูล item
   * @param {Object} options - ตัวเลือก
   * @param {string} options.type - 'barcode' | 'rfid' | 'qr' | 'thai'
   * @param {boolean} options.enableRFID - เปิดใช้ RFID
   * @param {number} options.quantity - จำนวน
   */
  async printSingle(item, options = {}) {
    const { type = 'barcode', enableRFID = false, quantity = 1, printerConfig } = options;
    
    try {
      let zpl;
      let epcData = null;
      
      // Generate EPC if needed
      if (enableRFID || type === 'rfid') {
        epcData = options.epc || EPCService.generate(item, {
          mode: options.epcMode || 'simple',
          prefix: options.epcPrefix || CONFIG.epcPrefix,
        });
        
        const validation = EPCService.validate(epcData);
        if (!validation.valid) {
          throw new Error(`Invalid EPC: ${validation.error}`);
        }
      }
      
      // Build ZPL based on type
      const labelOptions = {
        itemNumber: item.number,
        displayName: item.displayName || item.number,
        displayName2: item.displayName2 || '',
        barcodeData: item.barcodeData || item.number,
        qrData: item.qrData || item.number,
        epcData,
        quantity,
        labelSize: options.labelSize || CONFIG.defaultLabelSize,
      };
      
      switch (type) {
        case 'thai':
          zpl = await buildThaiLabel(labelOptions);
          break;
        case 'qr':
          zpl = buildQRLabel(labelOptions);
          break;
        case 'rfid':
          zpl = buildRFIDLabel(labelOptions);
          break;
        case 'barcode':
        default:
          zpl = enableRFID 
            ? buildRFIDLabel(labelOptions) 
            : buildBarcodeLabel(labelOptions);
      }
      
      // Send to printer
      const result = await sendZPL(zpl, printerConfig);
      
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
      return {
        success: false,
        error: error.message,
        item: { number: item.number },
      };
    }
  },
  
  /**
   * พิมพ์หลาย Label
   */
  async printBatch(items, options = {}) {
    const { delay = 100 } = options;
    const results = [];
    let success = 0, failed = 0;
    
    for (const item of items) {
      const result = await this.printSingle(item, options);
      results.push(result);
      result.success ? success++ : failed++;
      
      if (delay) await new Promise(r => setTimeout(r, delay));
    }
    
    return {
      success: failed === 0,
      summary: { total: items.length, success, failed },
      results,
    };
  },
  
  /**
   * Preview ZPL (ไม่พิมพ์)
   */
  async preview(item, options = {}) {
    const epcData = options.epc || EPCService.generate(item, {
      mode: options.epcMode || 'simple',
      prefix: options.epcPrefix || CONFIG.epcPrefix,
    });
    
    const labelOptions = {
      itemNumber: item.number,
      displayName: item.displayName || item.number,
      displayName2: item.displayName2 || '',
      barcodeData: item.number,
      epcData,
      quantity: 1,
      labelSize: options.labelSize || CONFIG.defaultLabelSize,
    };
    
    let zpl;
    switch (options.type) {
      case 'thai':
        zpl = await buildThaiLabel(labelOptions);
        break;
      case 'qr':
        zpl = buildQRLabel(labelOptions);
        break;
      default:
        zpl = buildRFIDLabel(labelOptions);
    }
    
    return {
      zpl,
      epc: epcData,
      epcParsed: EPCService.parse(epcData),
      item: labelOptions,
    };
  },
};

// ============================================
// Printer Service
// ============================================

export const PrinterService = {
  async testConnection(config) {
    const printer = new RFIDPrinter(config);
    return printer.testConnection();
  },
  
  async getStatus(config) {
    const printer = new RFIDPrinter(config);
    return printer.getStatus();
  },
  
  async calibrate(config) {
    const printer = new RFIDPrinter(config);
    return printer.calibrate();
  },
  
  async cancelAll(config) {
    const printer = new RFIDPrinter(config);
    return printer.cancelAll();
  },
  
  async reset(config) {
    const printer = new RFIDPrinter(config);
    return printer.reset();
  },
};

// ============================================
// Export
// ============================================

export default { PrintService, PrinterService };