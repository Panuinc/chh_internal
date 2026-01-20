import { PRINTER_CONFIG, TIMEOUTS, DEFAULT_LABEL_SIZE, EPC_CONFIG } from "./config.js";
import { delay } from "./utils.js";
import { EPCService } from "./epc.js";
import { RFIDPrinter } from "./printer.js";
import { buildThaiQRLabel, buildThaiLabel, buildThaiRFIDLabel } from "./zpl.js";

export {
  PRINTER_CONFIG,
  TIMEOUTS,
  DEFAULT_LABEL_SIZE,
  EPC_CONFIG,
} from "./config.js";

export { RFIDPrinter, sendZPL, testConnection, getPrinterStatus } from "./printer.js";
export { textToGraphic, buildThaiQRLabel, buildThaiLabel, buildThaiRFIDLabel, PrinterCommands } from "./zpl.js";
export { loadLogo, generatePackingSlipZPL, generateAllPackingSlips, previewPackingSlip, calculateTotalPieces } from "./packingSlip.js";
export { EPCService } from "./epc.js";
export { delay } from "./utils.js";

export const PrinterService = {
  async testConnection(config = {}) {
    const printer = new RFIDPrinter({
      host: config.host || PRINTER_CONFIG.host,
      port: config.port || PRINTER_CONFIG.port,
    });
    try {
      return await printer.testConnection();
    } finally {
      printer.closeAllConnections();
    }
  },

  async getStatus(config = {}) {
    const printer = new RFIDPrinter({
      host: config.host || PRINTER_CONFIG.host,
      port: config.port || PRINTER_CONFIG.port,
    });
    try {
      return await printer.getStatus();
    } finally {
      printer.closeAllConnections();
    }
  },

  async calibrate(config = {}) {
    const printer = new RFIDPrinter({
      host: config.host || PRINTER_CONFIG.host,
      port: config.port || PRINTER_CONFIG.port,
    });
    try {
      return await printer.calibrate();
    } finally {
      printer.closeAllConnections();
    }
  },

  async reset(config = {}) {
    const printer = new RFIDPrinter({
      host: config.host || PRINTER_CONFIG.host,
      port: config.port || PRINTER_CONFIG.port,
    });
    try {
      return await printer.reset();
    } finally {
      printer.closeAllConnections();
    }
  },

  async fullReset(config = {}) {
    const printer = new RFIDPrinter({
      host: config.host || PRINTER_CONFIG.host,
      port: config.port || PRINTER_CONFIG.port,
    });
    try {
      return await printer.fullReset();
    } finally {
      printer.closeAllConnections();
    }
  },

  async cancelAll(config = {}) {
    const printer = new RFIDPrinter({
      host: config.host || PRINTER_CONFIG.host,
      port: config.port || PRINTER_CONFIG.port,
    });
    try {
      return await printer.cancelAll();
    } finally {
      printer.closeAllConnections();
    }
  },

  async feedLabel(config = {}) {
    const printer = new RFIDPrinter({
      host: config.host || PRINTER_CONFIG.host,
      port: config.port || PRINTER_CONFIG.port,
    });
    try {
      return await printer.feedLabel();
    } finally {
      printer.closeAllConnections();
    }
  },

  async pause(config = {}) {
    const printer = new RFIDPrinter({
      host: config.host || PRINTER_CONFIG.host,
      port: config.port || PRINTER_CONFIG.port,
    });
    try {
      return await printer.pause();
    } finally {
      printer.closeAllConnections();
    }
  },

  async resume(config = {}) {
    const printer = new RFIDPrinter({
      host: config.host || PRINTER_CONFIG.host,
      port: config.port || PRINTER_CONFIG.port,
    });
    try {
      return await printer.resume();
    } finally {
      printer.closeAllConnections();
    }
  },
};

export const PrintService = {
  async generateLabel(item, options = {}) {
    const {
      type = "thai",
      labelSize = DEFAULT_LABEL_SIZE,
      epcMode,
      epcPrefix,
    } = options;

    const labelOptions = {
      itemNumber: item.number,
      displayName: item.displayName || item.number,
      displayName2: item.displayName2 || "",
      labelSize,
      quantity: 1,
    };

    let zpl;
    let epc = null;
    let epcParsed = null;

    switch (type) {
      case "thai-qr":
        zpl = await buildThaiQRLabel({ ...labelOptions, qrData: item.qrData || item.number });
        break;

      case "thai-rfid":
        epc = EPCService.generate(item, { mode: epcMode, prefix: epcPrefix });
        epcParsed = EPCService.parse(epc);
        zpl = await buildThaiRFIDLabel({ ...labelOptions, epcData: epc });
        break;

      case "thai":
      default:
        zpl = await buildThaiLabel({ ...labelOptions, barcodeData: item.barcodeData || item.number });
        break;
    }

    return { zpl, epc, epcParsed, type, item };
  },

  async preview(item, options = {}) {
    const result = await this.generateLabel(item, options);
    return { ...result, enableRFID: options.enableRFID || false };
  },

  async printSingle(item, options = {}) {
    const { quantity = 1, ...labelOptions } = options;
    const printer = new RFIDPrinter();

    try {
      const { zpl, epc, epcParsed, type } = await this.generateLabel(item, labelOptions);
      const finalZpl = zpl.replace(/\^PQ\d+/, `^PQ${quantity}`);
      const result = await printer.sendWithRetry(finalZpl);

      return {
        success: result.success,
        item: { ...item, epc },
        epcParsed,
        type,
        quantity,
        error: result.error,
      };
    } catch (error) {
      return { success: false, item, error: error.message };
    } finally {
      printer.closeAllConnections();
    }
  },

  async printBatch(items, options = {}) {
    const { delay: printDelay = 100, quantity = 1, ...labelOptions } = options;

    const results = [];
    let successCount = 0;
    let failCount = 0;

    const printer = new RFIDPrinter();

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        try {
          const { zpl, epc, epcParsed, type } = await this.generateLabel(item, labelOptions);
          const finalZpl = zpl.replace(/\^PQ\d+/, `^PQ${quantity}`);
          const result = await printer.sendWithRetry(finalZpl);

          if (result.success) {
            successCount++;
            results.push({ success: true, item: { ...item, epc }, epcParsed, type });
          } else {
            failCount++;
            results.push({ success: false, item, error: result.error || "Send failed" });
          }
        } catch (error) {
          failCount++;
          results.push({ success: false, item, error: error.message });
        }

        if (i < items.length - 1 && printDelay > 0) {
          await delay(printDelay);
        }
      }

      return {
        success: failCount === 0,
        results,
        summary: { total: items.length, success: successCount, failed: failCount },
      };
    } finally {
      printer.closeAllConnections();
    }
  },
};