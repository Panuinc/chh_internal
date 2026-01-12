export const PRINTER_CONFIG = {
  host:
    process.env.RFID_PRINTER_IP ||
    process.env.NEXT_PUBLIC_RFID_PRINTER_IP ||
    "192.168.0.20",
  port: parseInt(
    process.env.RFID_PRINTER_PORT ||
      process.env.NEXT_PUBLIC_RFID_PRINTER_PORT ||
      "9100",
    10
  ),
  timeout: parseInt(process.env.RFID_PRINTER_TIMEOUT || "15000", 10),
  retries: 3,
  retryDelay: 1000,
};

export const LABEL_PRESETS = [
  { name: "Standard (100x30)", width: 100, height: 30, isDefault: true },
  { name: "Small (50x25)", width: 50, height: 25 },
  { name: "Medium (75x50)", width: 75, height: 50 },
  { name: "Large (100x50)", width: 100, height: 50 },
  { name: "Custom", width: null, height: null },
];

export const DEFAULT_LABEL_SIZE = {
  width: parseInt(process.env.LABEL_WIDTH || "100", 10),
  height: parseInt(process.env.LABEL_HEIGHT || "30", 10),
};

export const PRINT_TYPES = {
  "thai-qr": {
    key: "thai-qr",
    name: "ภาษาไทย + QR Code",
    label: "1. ภาษาไทย + QR Code",
    hasRFID: false,
    description: "พิมพ์ฉลากภาษาไทยพร้อม QR Code",
  },
  thai: {
    key: "thai",
    name: "ภาษาไทย + Barcode",
    label: "2. ภาษาไทย + Barcode",
    hasRFID: false,
    description: "พิมพ์ฉลากภาษาไทยพร้อม Barcode",
  },
  "thai-rfid": {
    key: "thai-rfid",
    name: "ภาษาไทย + RFID",
    label: "3. ภาษาไทย + RFID",
    hasRFID: true,
    description: "พิมพ์ฉลากภาษาไทยพร้อมเขียน RFID Tag",
  },
};

export const PRINT_TYPE_OPTIONS = Object.values(PRINT_TYPES);

export const EPC_CONFIG = {
  prefix: process.env.EPC_PREFIX || "PK",
  companyPrefix: process.env.GS1_COMPANY_PREFIX || "0885000",
  mode: process.env.EPC_MODE || "simple",
};

export const EPC_MODES = [
  {
    value: "simple",
    label: "Simple (Recommended)",
    description: "Basic EPC with prefix and item number",
  },
  {
    value: "sgtin96",
    label: "SGTIN-96",
    description: "GS1 standard format",
  },
  {
    value: "unique",
    label: "Unique",
    description: "Random unique identifier",
  },
];

export const ZPL_CONFIG = {
  dotsPerMm: 11.8,
  padding: {
    top: 2,
    bottom: 5,
    left: 5,
    right: 5,
  },
};

export const STATUS_COLORS = {
  connected: "success",
  disconnected: "danger",
  checking: "warning",
  error: "danger",
  Active: "success",
  Blocked: "danger",
};

export const API_ENDPOINTS = {
  print: "/api/chainWay/print",
  printer: "/api/chainWay/printer",
  catPacking: "/api/warehouse/catPacking",
};

export const TIMEOUTS = {
  print: 30000,
  connection: 5000,
  status: 10000,
  action: 15000,
  healthCheck: 5000,
};

export const STORAGE_KEYS = {
  printerSettings: "rfid-printer-settings",
};

export function getPrintType(key) {
  return PRINT_TYPES[key] || PRINT_TYPES["thai"];
}

export function hasRFID(typeKey) {
  return PRINT_TYPES[typeKey]?.hasRFID || false;
}

export function getDefaultLabelPreset() {
  return LABEL_PRESETS.find((p) => p.isDefault) || LABEL_PRESETS[0];
}

export default {
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
};
