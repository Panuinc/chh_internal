/**
 * RFID Print Service Module
 * รวม logic ทั้งหมดสำหรับการพิมพ์ label
 */

import { EPCService } from "./epc.js";
import {
  buildBarcodeLabel,
  buildRFIDLabel,
  buildQRLabel,
  buildThaiLabel,
  buildThaiQRLabel,
} from "./zpl.js";
import { RFIDPrinter, sendZPL } from "./printer.js";

/**
 * การตั้งค่าเริ่มต้น
 */
export const SERVICE_CONFIG = {
  defaultLabelSize: {
    width: parseInt(process.env.LABEL_WIDTH || "100", 10),
    height: parseInt(process.env.LABEL_HEIGHT || "80", 10),
  },
  epcPrefix: process.env.EPC_PREFIX || "PK",
  companyPrefix: process.env.GS1_COMPANY_PREFIX || "0885000",
  epcMode: process.env.EPC_MODE || "simple",
};

/**
 * สร้าง logger
 */
function createLogger(context) {
  return {
    start: (data) => console.log(`[${context}] Start:`, JSON.stringify(data)),
    success: (data) => console.log(`[${context}] Success:`, JSON.stringify(data)),
    error: (data) => console.error(`[${context}] Error:`, JSON.stringify(data)),
  };
}

/**
 * PrintService - บริการพิมพ์ label
 */
export const PrintService = {
  /**
   * พิมพ์ label เดียว
   * @param {Object} item - ข้อมูลสินค้า
   * @param {Object} options - ตัวเลือก
   * @returns {Promise<Object>} ผลการพิมพ์
   */
  async printSingle(item, options = {}) {
    const log = createLogger("PrintService.printSingle");
    const {
      type = "barcode", // barcode, qr, thai, thai-qr
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

      // สร้าง EPC ถ้าต้องการ RFID
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

      // เตรียมข้อมูลสำหรับ label
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

      // สร้าง ZPL ตามประเภท
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

      // ส่งไปพิมพ์
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
        zpl, // รวม ZPL สำหรับ debug
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

  /**
   * พิมพ์หลาย label
   * @param {Array} items - รายการสินค้า
   * @param {Object} options - ตัวเลือก
   * @returns {Promise<Object>} ผลการพิมพ์
   */
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

      // หน่วงเวลาระหว่างแต่ละ label
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

  /**
   * Preview label โดยไม่พิมพ์จริง
   * @param {Object} item - ข้อมูลสินค้า
   * @param {Object} options - ตัวเลือก
   * @returns {Promise<Object>} ข้อมูล preview
   */
  async preview(item, options = {}) {
    const {
      type = "barcode",
      enableRFID = false,
      labelSize = SERVICE_CONFIG.defaultLabelSize,
    } = options;

    // สร้าง EPC
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

/**
 * PrinterService - บริการจัดการ printer
 */
export const PrinterService = {
  /**
   * ทดสอบการเชื่อมต่อ
   */
  async testConnection(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.testConnection();
    } finally {
      printer.closeAllConnections();
    }
  },

  /**
   * อ่านสถานะ
   */
  async getStatus(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.getStatus();
    } finally {
      printer.closeAllConnections();
    }
  },

  /**
   * Calibrate
   */
  async calibrate(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.calibrate();
    } finally {
      printer.closeAllConnections();
    }
  },

  /**
   * ยกเลิกงานพิมพ์ทั้งหมด
   */
  async cancelAll(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.cancelAll();
    } finally {
      printer.closeAllConnections();
    }
  },

  /**
   * Reset printer (soft reset)
   */
  async reset(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.reset();
    } finally {
      printer.closeAllConnections();
    }
  },

  /**
   * Full reset - ใช้เมื่อ soft reset ไม่ได้ผล
   */
  async fullReset(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.fullReset();
    } finally {
      printer.closeAllConnections();
    }
  },

  /**
   * Feed one label
   */
  async feedLabel(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.feedLabel();
    } finally {
      printer.closeAllConnections();
    }
  },

  /**
   * Pause printing
   */
  async pause(config) {
    const printer = new RFIDPrinter(config);
    try {
      return await printer.pause();
    } finally {
      printer.closeAllConnections();
    }
  },

  /**
   * Resume printing
   */
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