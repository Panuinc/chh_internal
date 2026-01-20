// Printer configuration from environment variables
export const PRINTER_CONFIG = {
  host: process.env.RFID_PRINTER_IP || "169.254.112.200",
  port: parseInt(process.env.RFID_PRINTER_PORT || "9100", 10),
  timeout: 15000,
  retries: 3,
  retryDelay: 1000,
};

export const COMPANY_INFO = {
  name: "บริษัท ชื้ออะฮวด อุตสาหกรรม จำกัด",
  address: "9/1 หมู่ 2 ถนนบางเลน-ลาดหลุมแก้ว",
  district: "ต.ขุนศรี อ.ไทรน้อย จ.นนทบุรี 11150",
  phone: "02-921-9979",
};

export const ZPL_CONFIG = {
  dotsPerMm: 11.8,
  padding: { top: 2, bottom: 5, left: 5, right: 5 },
};

// Only 2 label sizes used
export const LABEL_SIZES = {
  // For barcode, QR code, RFID labels
  STANDARD: {
    width: parseInt(process.env.LABEL_WIDTH || "100", 10),
    height: parseInt(process.env.LABEL_HEIGHT || "30", 10),
  },
  // For packing slip / sales order
  PACKING_SLIP: {
    width: 100,
    height: 150,
  },
};

// Packing slip label dimensions (calculated)
export const PACKING_SLIP_LABEL = {
  WIDTH_MM: LABEL_SIZES.PACKING_SLIP.width,
  HEIGHT_MM: LABEL_SIZES.PACKING_SLIP.height,
  get WIDTH_DOTS() {
    return Math.round(this.WIDTH_MM * ZPL_CONFIG.dotsPerMm);
  },
  get HEIGHT_DOTS() {
    return Math.round(this.HEIGHT_MM * ZPL_CONFIG.dotsPerMm);
  },
  get MARGIN() {
    return Math.round(2 * ZPL_CONFIG.dotsPerMm);
  },
};

const createSection = (topMm) =>
  Math.round(PACKING_SLIP_LABEL.MARGIN + topMm * ZPL_CONFIG.dotsPerMm);

export const PACKING_SLIP_SECTIONS = {
  get MARGIN() {
    return PACKING_SLIP_LABEL.MARGIN;
  },
  get HEADER_TOP() {
    return this.MARGIN;
  },
  get HEADER_BOTTOM() {
    return createSection(20);
  },
  get RECIPIENT_TOP() {
    return createSection(21);
  },
  get RECIPIENT_BOTTOM() {
    return createSection(41);
  },
  get TABLE_HEADER_TOP() {
    return createSection(42);
  },
  get TABLE_HEADER_BOTTOM() {
    return createSection(47);
  },
  get TABLE_BODY_TOP() {
    return createSection(47);
  },
  get TABLE_BODY_BOTTOM() {
    return createSection(122);
  },
  get FOOTER_TOP() {
    return createSection(123);
  },
  get FOOTER_BOTTOM() {
    return createSection(148);
  },
};

// Print types available
export const PRINT_TYPES = {
  "thai-qr": {
    key: "thai-qr",
    name: "ภาษาไทย + QR Code",
    label: "1. ภาษาไทย + QR Code",
    hasRFID: false,
  },
  thai: {
    key: "thai",
    name: "ภาษาไทย + Barcode",
    label: "2. ภาษาไทย + Barcode",
    hasRFID: false,
  },
  "thai-rfid": {
    key: "thai-rfid",
    name: "ภาษาไทย + RFID",
    label: "3. ภาษาไทย + RFID",
    hasRFID: true,
  },
};

export const PRINT_TYPE_OPTIONS = Object.values(PRINT_TYPES);

// EPC configuration from environment
export const EPC_CONFIG = {
  prefix: process.env.EPC_PREFIX || "PK",
  companyPrefix: process.env.GS1_COMPANY_PREFIX || "0885000",
  mode: process.env.EPC_MODE || "simple",
};

// Status colors for UI
export const STATUS_COLORS = {
  connected: "success",
  disconnected: "danger",
  checking: "warning",
  error: "danger",
  Active: "success",
  Blocked: "danger",
};

// Timeouts
export const TIMEOUTS = {
  print: 30000,
  connection: 5000,
  status: 10000,
  action: 15000,
  healthCheck: 5000,
  command: 30000,
};

// Helper functions
export function getPrintType(key) {
  return PRINT_TYPES[key] || PRINT_TYPES.thai;
}

export function hasRFID(typeKey) {
  return PRINT_TYPES[typeKey]?.hasRFID || false;
}
