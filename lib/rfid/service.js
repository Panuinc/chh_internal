import { EPCService } from "./epc.js";
import {
  buildBarcodeLabel,
  buildRFIDLabel,
  buildQRLabel,
  buildThaiLabel,
  buildThaiQRLabel,
} from "./zpl.js";
import { RFIDPrinter, sendZPL } from "./printer.js";

export const SERVICE_CONFIG = {
  defaultLabelSize: {
    width: parseInt(process.env.LABEL_WIDTH || "100", 10),
    height: parseInt(process.env.LABEL_HEIGHT || "80", 10),
  },
  epcPrefix: process.env.EPC_PREFIX || "PK",
  companyPrefix: process.env.GS1_COMPANY_PREFIX || "0885000",
  epcMode: process.env.EPC_MODE || "simple",
};

function createLogger(context) {
  return {
    start: (data) => console.log(`[${context}] Start:`, JSON.stringify(data)),
    success: (data) => console.log(`[${context}] Success:`, JSON.stringify(data)),
    error: (data) => console.error(`[${context}] Error:`, JSON.stringify(data)),
  };
}

export const PrintService = {
  async printSingle(item, options = {}) {
    const log = createLogger("PrintService.printSingle");
    const {
      type = "barcode",
      enableRFID = false,
      quantity = 1,
      printerConfig,
      labelSize = SERVICE_CONFIG.defaultLabelSize,
    } = options;

    log.start({
      itemNumber: item.number,
      type,
      enableRFID,
      quantity,
    });

    try {
      let zpl;
      let epcData = null;

      if (enableRFID) {
        epcData = options.epc || EPCService.generate(item, {
          mode: options.epcMode || SERVICE_CONFIG.epcMode,
          prefix: options.epcPrefix || SERVICE_CONFIG.epcPrefix,
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
        case "thai":
          zpl = await buildThaiLabel(labelOptions);
          break;
        case "thai-qr":
          zpl = await buildThaiQRLabel(labelOptions);
          break;
        case "qr":
          zpl = buildQRLabel(labelOptions);
          break;
        case "rfid":
          zpl = buildRFIDLabel(labelOptions);
          break;
        case "barcode":
        default:
          zpl = enableRFID ? buildRFIDLabel(labelOptions) : buildBarcodeLabel(labelOptions);
      }

      const result = await sendZPL(zpl, printerConfig);

      log.success({
        itemNumber: item.number,
        epc: epcData,
        type,
        enableRFID,
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
        zpl,
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

    for (const item of items) {
      const result = await this.printSingle(item, options);
      results.push(result);

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }

      if (delay && items.indexOf(item) < items.length - 1) {
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
      type = "barcode",
      enableRFID = false,
      labelSize = SERVICE_CONFIG.defaultLabelSize,
    } = options;

    const epcData = options.epc || EPCService.generate(item, {
      mode: options.epcMode || SERVICE_CONFIG.epcMode,
      prefix: options.epcPrefix || SERVICE_CONFIG.epcPrefix,
    });

    const labelOptions = {
      itemNumber: item.number,
      displayName: item.displayName || item.number,
      displayName2: item.displayName2 || "",
      barcodeData: item.barcodeData || item.number,
      qrData: item.qrData || item.number,
      epcData: enableRFID ? epcData : null,
      quantity: 1,
      labelSize,
    };

    let zpl;
    switch (type) {
      case "thai":
        zpl = await buildThaiLabel(labelOptions);
        break;
      case "thai-qr":
        zpl = await buildThaiQRLabel(labelOptions);
        break;
      case "qr":
        zpl = buildQRLabel(labelOptions);
        break;
      default:
        zpl = enableRFID ? buildRFIDLabel(labelOptions) : buildBarcodeLabel(labelOptions);
    }

    return {
      zpl,
      epc: epcData,
      epcParsed: EPCService.parse(epcData),
      item: labelOptions,
      type,
      enableRFID,
    };
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
  SERVICE_CONFIG,
};