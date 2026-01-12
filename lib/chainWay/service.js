import { EPCService } from "./epc.js";
import { buildThaiQRLabel, buildThaiLabel, buildThaiRFIDLabel } from "./zpl.js";
import { RFIDPrinter, sendZPL } from "./printer.js";
import { DEFAULT_LABEL_SIZE, EPC_CONFIG, PRINT_TYPES } from "./config.js";

function createLogger(context) {
  const isDev = process.env.NODE_ENV !== "production";
  return {
    start: (data) =>
      isDev && console.log(`[${context}] Start:`, JSON.stringify(data)),
    success: (data) =>
      isDev && console.log(`[${context}] Success:`, JSON.stringify(data)),
    error: (data) => console.error(`[${context}] Error:`, JSON.stringify(data)),
  };
}

export const PrintService = {
  async printSingle(item, options = {}) {
    const log = createLogger("PrintService.printSingle");
    const {
      type = "thai",
      enableRFID = false,
      quantity = 1,
      printerConfig,
      labelSize = DEFAULT_LABEL_SIZE,
    } = options;

    log.start({ itemNumber: item.number, type, enableRFID, quantity });

    try {
      let zpl;
      let epcData = null;

      if (enableRFID || PRINT_TYPES[type]?.hasRFID) {
        epcData =
          options.epc ||
          EPCService.generate(item, {
            mode: options.epcMode || EPC_CONFIG.mode,
            prefix: options.epcPrefix || EPC_CONFIG.prefix,
          });

        const validation = EPCService.validate(epcData);
        if (!validation.valid) {
          throw new Error(`Invalid EPC: ${validation.error}`);
        }
      }

      const labelOptions = {
        itemNumber: item.number,
        displayName: item.displayName || item.number,
        displayName2: item.displayName2 || "",
        barcodeData: item.barcodeData || item.number,
        qrData: item.qrData || item.number,
        epcData,
        quantity,
        labelSize,
      };

      switch (type) {
        case "thai-qr":
          zpl = await buildThaiQRLabel(labelOptions);
          break;
        case "thai-rfid":
          zpl = await buildThaiRFIDLabel(labelOptions);
          break;
        case "thai":
        default:
          zpl = await buildThaiLabel(labelOptions);
      }

      const result = await sendZPL(zpl, printerConfig);

      log.success({ itemNumber: item.number, epc: epcData, type });

      return {
        success: true,
        item: {
          number: item.number,
          displayName: item.displayName,
          epc: epcData,
          epcParsed: epcData ? EPCService.parse(epcData) : null,
        },
        printer: result,
        zpl,
        type,
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

  async printBatch(items, options = {}) {
    const log = createLogger("PrintService.printBatch");
    const { delay = 100 } = options;

    log.start({ itemCount: items.length, delay });

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const result = await this.printSingle(item, options);
      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }

      if (delay && i < items.length - 1) {
        await new Promise((r) => setTimeout(r, delay));
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

  async preview(item, options = {}) {
    const {
      type = "thai",
      enableRFID = false,
      labelSize = DEFAULT_LABEL_SIZE,
    } = options;

    let epcData = null;
    if (enableRFID || PRINT_TYPES[type]?.hasRFID) {
      epcData =
        options.epc ||
        EPCService.generate(item, {
          mode: options.epcMode || EPC_CONFIG.mode,
          prefix: options.epcPrefix || EPC_CONFIG.prefix,
        });
    }

    const labelOptions = {
      itemNumber: item.number,
      displayName: item.displayName || item.number,
      displayName2: item.displayName2 || "",
      barcodeData: item.barcodeData || item.number,
      qrData: item.qrData || item.number,
      epcData,
      quantity: 1,
      labelSize,
    };

    let zpl;
    switch (type) {
      case "thai-qr":
        zpl = await buildThaiQRLabel(labelOptions);
        break;
      case "thai-rfid":
        zpl = await buildThaiRFIDLabel(labelOptions);
        break;
      case "thai":
      default:
        zpl = await buildThaiLabel(labelOptions);
    }

    return {
      zpl,
      epc: epcData,
      epcParsed: epcData ? EPCService.parse(epcData) : null,
      item: labelOptions,
      type,
      enableRFID: enableRFID || PRINT_TYPES[type]?.hasRFID,
      labelSize,
    };
  },

  getAvailableTypes() {
    return PRINT_TYPES;
  },
};

export const PrinterService = {
  async testConnection(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.testConnection();
    } finally {
      printer.closeAllConnections();
    }
  },

  async getStatus(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.getStatus();
    } finally {
      printer.closeAllConnections();
    }
  },

  async calibrate(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.calibrate();
    } finally {
      printer.closeAllConnections();
    }
  },

  async cancelAll(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.cancelAll();
    } finally {
      printer.closeAllConnections();
    }
  },

  async reset(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.reset();
    } finally {
      printer.closeAllConnections();
    }
  },

  async fullReset(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.fullReset();
    } finally {
      printer.closeAllConnections();
    }
  },

  async feedLabel(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.feedLabel();
    } finally {
      printer.closeAllConnections();
    }
  },

  async pause(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.pause();
    } finally {
      printer.closeAllConnections();
    }
  },

  async resume(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.resume();
    } finally {
      printer.closeAllConnections();
    }
  },
};

export { EPCService };

export default {
  PrintService,
  PrinterService,
  EPCService,
};
