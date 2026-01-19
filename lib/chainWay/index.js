export {
  PRINTER_CONFIG,
  COMPANY_INFO,
  ZPL_CONFIG,
  LABEL_PRESETS,
  DEFAULT_LABEL_SIZE,
  PACKING_SLIP_LABEL,
  PACKING_SLIP_SECTIONS,
  PRINT_TYPES,
  PRINT_TYPE_OPTIONS,
  EPC_CONFIG,
  EPC_MODES,
  STATUS_COLORS,
  API_ENDPOINTS,
  TIMEOUTS,
  STORAGE_KEYS,
  getPrintType,
  hasRFID,
  getDefaultLabelPreset,
} from "./config.js";

export {
  mmToDots,
  mm,
  sanitizeText,
  sanitize,
  splitText,
  generateOrderQRUrl,
  getQRUrl,
  getBaseUrl,
  calculateTotalPieces,
  getItemLines,
  createLogger,
  delay,
} from "./utils.js";

export {
  EPCService,
  generateSGTIN96,
  generateSimpleEPC,
  generateUniqueEPC,
} from "./epc.js";

const RFIDLib = {
  async print(item, options = {}) {
    const { PrintService } = await import("./service.js");
    return PrintService.printSingle(item, options);
  },

  async printBatch(items, options = {}) {
    const { PrintService } = await import("./service.js");
    return PrintService.printBatch(items, options);
  },

  async preview(item, options = {}) {
    const { PrintService } = await import("./service.js");
    return PrintService.preview(item, options);
  },

  async testConnection(config) {
    const { PrinterService } = await import("./service.js");
    return PrinterService.testConnection(config);
  },

  async getStatus(config) {
    const { PrinterService } = await import("./service.js");
    return PrinterService.getStatus(config);
  },

  async fullReset(config) {
    const { PrinterService } = await import("./service.js");
    return PrinterService.fullReset(config);
  },

  async generateEPC(item, options) {
    const { EPCService } = await import("./epc.js");
    return EPCService.generate(item, options);
  },

  async printPackingSlips(orders, onProgress) {
    const { printPackingSlips } = await import("./packingSlip.js");
    return printPackingSlips(orders, onProgress);
  },

  getAvailableTypes() {
    const { PRINT_TYPES } = require("./config.js");
    return PRINT_TYPES;
  },

  getLabelPresets() {
    const { LABEL_PRESETS } = require("./config.js");
    return LABEL_PRESETS;
  },
};

export default RFIDLib;
