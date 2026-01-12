export {
  PRINTER_CONFIG,
  LABEL_PRESETS,
  DEFAULT_LABEL_SIZE,
  PRINT_TYPES,
  PRINT_TYPE_OPTIONS,
  EPC_CONFIG,
  EPC_MODES,
  ZPL_CONFIG,
  STATUS_COLORS,
  API_ENDPOINTS,
  TIMEOUTS,
  STORAGE_KEYS,
  getPrintType,
  hasRFID,
  getDefaultLabelPreset,
} from "./config.js";

export {
  EPCService,
  generateSGTIN96,
  generateSimpleEPC,
  generateUniqueEPC,
} from "./epc.js";

export {
  textToGraphic,
  buildThaiQRLabel,
  buildThaiLabel,
  buildThaiRFIDLabel,
  PrinterCommands,
} from "./zpl.js";

export {
  RFIDPrinter,
  createPrinter,
  sendZPL,
  testConnection,
  getPrinterStatus,
} from "./printer.js";

export { PrintService, PrinterService } from "./service.js";

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
