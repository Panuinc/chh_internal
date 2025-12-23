export {
  generateSGTIN96,
  generateSimpleEPC,
  generateUniqueEPC,
  EPCService,
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
  sendZPL,
  testConnection,
  getPrinterStatus,
} from "./printer.js";

export {
  PrintService,
  PrinterService,
  SERVICE_CONFIG,
  PRINT_TYPES,
} from "./service.js";

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

  async fullReset(config) {
    const { PrinterService } = await import("./service.js");
    return PrinterService.fullReset(config);
  },

  async generateEPC(item, options) {
    const { EPCService } = await import("./epc.js");
    return EPCService.generate(item, options);
  },

  getAvailableTypes() {
    return {
      "thai-qr": { name: "ภาษาไทย + QR Code", hasRFID: false },
      "thai": { name: "ภาษาไทย + Barcode", hasRFID: false },
      "thai-rfid": { name: "ภาษาไทย + RFID", hasRFID: true },
    };
  },
};

export default RFIDLib;