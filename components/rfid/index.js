/**
 * RFID Module - Main Export File
 * 
 * สำหรับ Chainway CP30 RFID Printer Integration
 */

// ============================================
// Library Exports
// ============================================

export {
  // EPC Generators
  generateSGTIN96,
  generateSimpleEPC,
  generateUniqueEPC,
  
  // ZPL Builders
  buildRFIDLabel,
  buildBarcodeLabel,
  buildQRCodeRFIDLabel,
  buildRFIDReadCommand,
  buildStatusCommand,
  buildCalibrateCommand,
  buildBatchRFIDLabels,
} from './lib/zplBuilder.js';

export {
  // Printer Connection
  RFIDPrinter,
  getPrinter,
  sendZPLToPrinter,
  testPrinterConnection,
  getPrinterStatus,
} from './lib/printer.js';

export {
  // Services
  EPCService,
  PrintService,
  PrinterService,
  SERVICE_CONFIG,
} from './lib/rfidService.js';

// ============================================
// Hooks Exports
// ============================================

export {
  useRFIDPrint,
  usePrinterStatus,
  useRFIDPreview,
  useRFID,
} from './hooks/useRFID.js';

// ============================================
// Components Exports
// ============================================

export {
  RFIDPrintButton,
  PrinterStatusBadge,
  RFIDPrintDialog,
} from './components/RFIDPrintButton.jsx';

export {
  PrinterSettings,
  PrintHistory,
  EPCPreview,
} from './components/PrinterSettings.jsx';

// ============================================
// Default Export
// ============================================

export default {
  // Quick access to common functions
  print: async (item, options) => {
    const { PrintService } = await import('./lib/rfidService.js');
    return PrintService.printSingle(item, options);
  },
  
  printBatch: async (items, options) => {
    const { PrintService } = await import('./lib/rfidService.js');
    return PrintService.printBatch(items, options);
  },
  
  testConnection: async (config) => {
    const { PrinterService } = await import('./lib/rfidService.js');
    return PrinterService.testConnection(config);
  },
  
  generateEPC: (item, options) => {
    const { EPCService } = require('./lib/rfidService.js');
    return EPCService.generate(item, options);
  },
};