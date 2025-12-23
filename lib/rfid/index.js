/**
 * RFID Library
 * รวม exports ทั้งหมดสำหรับ RFID printing
 */

// EPC Generation
export {
  generateSGTIN96,
  generateSimpleEPC,
  generateUniqueEPC,
  EPCService,
} from "./epc.js";

// ZPL Label Building
export {
  textToGraphic,
  buildBarcodeLabel,
  buildRFIDLabel,
  buildQRLabel,
  buildThaiLabel,
  buildThaiQRLabel,
  PrinterCommands,
} from "./zpl.js";

// Printer Communication
export {
  RFIDPrinter,
  getPrinter,
  sendZPL,
  testConnection,
  getPrinterStatus,
} from "./printer.js";

// Services
export {
  PrintService,
  PrinterService,
  SERVICE_CONFIG,
} from "./service.js";

// Default export สำหรับการใช้งานง่าย
export default {
  /**
   * พิมพ์ label เดียว
   */
  print: async (item, options = {}) => {
    const { PrintService } = await import("./service.js");
    return PrintService.printSingle(item, options);
  },

  /**
   * พิมพ์หลาย label
   */
  printBatch: async (items, options = {}) => {
    const { PrintService } = await import("./service.js");
    return PrintService.printBatch(items, options);
  },

  /**
   * Preview label
   */
  preview: async (item, options = {}) => {
    const { PrintService } = await import("./service.js");
    return PrintService.preview(item, options);
  },

  /**
   * ทดสอบการเชื่อมต่อ
   */
  testConnection: async (config) => {
    const { PrinterService } = await import("./service.js");
    return PrinterService.testConnection(config);
  },

  /**
   * สร้าง EPC
   */
  generateEPC: (item, options) => {
    const { EPCService } = require("./epc.js");
    return EPCService.generate(item, options);
  },
};
