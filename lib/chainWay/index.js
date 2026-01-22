export {
  PRINTER_CONFIG,
  COMPANY_INFO,
  ZPL_CONFIG,
  LABEL_SIZES,
  PACKING_SLIP_LABEL,
  PRINT_TYPES,
  PRINT_TYPE_OPTIONS,
  EPC_CONFIG,
  TIMEOUTS,
} from "./config.js";

export {
  mmToDots,
  sanitizeText,
  splitText,
  generateOrderQRUrl,
  getBaseUrl,
  calculateTotalPieces,
  getItemLines,
  getCommentLines,
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
