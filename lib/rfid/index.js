/**
 * RFID Module - Main Export
 * 
 * การใช้งาน:
 * import { PrintService, EPCService } from '@/lib/rfid';
 * 
 * // พิมพ์ Label
 * await PrintService.printSingle(item, { type: 'barcode' });
 * await PrintService.printSingle(item, { type: 'rfid', enableRFID: true });
 * await PrintService.printSingle(item, { type: 'thai', enableRFID: true });
 * 
 * // พิมพ์หลายชิ้น
 * await PrintService.printBatch(items, { type: 'rfid' });
 */

// ============================================
// EPC Functions
// ============================================

export {
  generateSGTIN96,
  generateSimpleEPC,
  generateUniqueEPC,
  EPCService,
} from './epc.js';

// ============================================
// ZPL Functions
// ============================================

export {
  buildBarcodeLabel,
  buildRFIDLabel,
  buildQRLabel,
  buildThaiLabel,
  textToGraphic,
  PrinterCommands,
} from './zpl.js';

// ============================================
// Printer Functions
// ============================================

export {
  RFIDPrinter,
  sendZPL,
  testConnection,
  getPrinterStatus,
} from './printer.js';

// ============================================
// Services
// ============================================

export {
  PrintService,
  PrinterService,
} from './service.js';

// ============================================
// Default Export (Quick Access)
// ============================================

export default {
  // พิมพ์ label
  print: async (item, options = {}) => {
    const { PrintService } = await import('./service.js');
    return PrintService.printSingle(item, options);
  },
  
  // พิมพ์หลาย label
  printBatch: async (items, options = {}) => {
    const { PrintService } = await import('./service.js');
    return PrintService.printBatch(items, options);
  },
  
  // ทดสอบการเชื่อมต่อ
  testConnection: async (config) => {
    const { PrinterService } = await import('./service.js');
    return PrinterService.testConnection(config);
  },
  
  // สร้าง EPC
  generateEPC: (item, options) => {
    const { EPCService } = require('./epc.js');
    return EPCService.generate(item, options);
  },
};