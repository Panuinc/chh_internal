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
  TIMEOUTS,
  STORAGE_KEYS,
  getPrintType,
  hasRFID,
  getDefaultLabelPreset,
} from "./config.js";

export {
  mmToDots,
  sanitizeText,
  splitText,
  generateOrderQRUrl,
  getBaseUrl,
  calculateTotalPieces,
  getItemLines,
  delay,
} from "./utils.js";

export {
  EPCService,
  generateSGTIN96,
  generateSimpleEPC,
  generateUniqueEPC,
} from "./epc.js";

export {
  generatePackingSlipsViaAPI,
  printPackingSlips,
  previewPackingSlip,
} from "./packingSlipClient.js";