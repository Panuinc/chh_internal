import { EPC_CONFIG } from "./config.js";

let serialCounter = 0;

// ========== SGTIN-96 ==========
export function generateSGTIN96({ companyPrefix, itemRef, serial }) {
  const header = "30";
  const filter = "1";
  const partition = "5";

  const paddedCompany = companyPrefix.padStart(7, "0");
  const paddedItem = itemRef.padStart(6, "0");
  const paddedSerial = serial.padStart(11, "0");

  const binaryString =
    parseInt(header, 16).toString(2).padStart(8, "0") +
    parseInt(filter, 10).toString(2).padStart(3, "0") +
    parseInt(partition, 10).toString(2).padStart(3, "0") +
    parseInt(paddedCompany, 10).toString(2).padStart(24, "0") +
    parseInt(paddedItem, 10).toString(2).padStart(20, "0") +
    parseInt(paddedSerial, 10).toString(2).padStart(38, "0");

  let hexEPC = "";
  for (let i = 0; i < binaryString.length; i += 4) {
    hexEPC += parseInt(binaryString.substr(i, 4), 2).toString(16).toUpperCase();
  }

  return hexEPC.padEnd(24, "0");
}

// ========== Simple EPC (เดิม) ==========
export function generateSimpleEPC({ prefix = "PK", itemNumber, sequence }) {
  const header = "E2";

  let prefixHex = "";
  for (let i = 0; i < Math.min(prefix.length, 4); i++) {
    prefixHex += prefix.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
  }
  prefixHex = prefixHex.padEnd(8, "0");

  const itemHex = parseInt(itemNumber.replace(/\D/g, "") || "0", 10)
    .toString(16)
    .toUpperCase()
    .padStart(8, "0")
    .slice(-8);

  const seqHex = parseInt(sequence, 10)
    .toString(16)
    .toUpperCase()
    .padStart(6, "0")
    .slice(-6);

  return (header + prefixHex + itemHex + seqHex).slice(0, 24);
}

// ========== Unique EPC ==========
export function generateUniqueEPC({ prefix = "UID" } = {}) {
  const timestamp = Date.now().toString(16).toUpperCase();
  const random = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .toUpperCase()
    .padStart(6, "0");

  let prefixHex = "";
  for (let i = 0; i < Math.min(prefix.length, 3); i++) {
    prefixHex += prefix.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
  }

  return ("E2" + prefixHex + timestamp + random).slice(0, 24).toUpperCase();
}

// ========== Compact Item Number ==========
/**
 * ย่อ item number ให้พอดี 12 ตัวอักษร (สำหรับ 96-bit EPC)
 * ลบ "-" ออก และตัดให้เหลือ 12 ตัว
 * 
 * @example
 * "PK-19-15-540140" → "PK1915540140" (12 ตัว)
 * "PK-19-15-540140-ABC" → "PK191554014A" (12 ตัว, ตัดท้าย)
 */
export function compactItemNumber(itemNumber, maxLength = 12) {
  // ลบ "-" ออก
  let compact = itemNumber.replace(/-/g, "");
  
  // ถ้ายังยาวเกิน ให้ตัด
  if (compact.length > maxLength) {
    compact = compact.substring(0, maxLength);
  }
  
  return compact;
}

/**
 * Expand compact item number กลับ (ถ้าทราบ pattern)
 * สำหรับ pattern "XX9999999999" → "XX-99-99-999999"
 * 
 * @example
 * "PK1915540140" → "PK-19-15-540140"
 */
export function expandItemNumber(compact) {
  if (!compact || compact.length < 4) return compact;
  
  // ลอง pattern: XX-99-99-999999 (prefix 2 + groups of 2-2-6+)
  const match = compact.match(/^([A-Z]{2})(\d{2})(\d{2})(\d+)$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}-${match[4]}`;
  }
  
  // ถ้าไม่ match pattern ก็ return เดิม
  return compact;
}

// ========== ASCII EPC (รองรับหลายขนาด) ==========
/**
 * Generate EPC from item number as ASCII hex
 * 
 * ⚠️ สำคัญ: Tag ส่วนใหญ่รองรับแค่ 96-bit (12 ตัวอักษร)
 * 
 * รองรับหลายขนาด:
 * - 96-bit  = 12 bytes = 12 ตัวอักษร (24 hex chars) ✅ ทุก tag
 * - 128-bit = 16 bytes = 16 ตัวอักษร (32 hex chars) บาง tag
 * - 160-bit = 20 bytes = 20 ตัวอักษร (40 hex chars) tag พิเศษ
 * 
 * @param {string} itemNumber - Item number to encode
 * @param {number} bits - EPC size in bits (default: 96 for compatibility)
 * @returns {string} Hex encoded EPC
 * 
 * @example
 * generateASCIIEPC("PK1915540140", 96) 
 * → "504B31393135353430313430" (24 hex chars)
 */
export function generateASCIIEPC(itemNumber, bits = 96) {
  // คำนวณจำนวน bytes และ hex characters
  const bytes = Math.floor(bits / 8);
  const hexLength = bytes * 2;
  
  // ตัด item number ให้ไม่เกินจำนวน bytes
  const trimmed = itemNumber.substring(0, bytes);
  
  // แปลงแต่ละตัวอักษรเป็น ASCII hex
  let hexEPC = "";
  for (let i = 0; i < trimmed.length; i++) {
    hexEPC += trimmed.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
  }
  
  // เติม 0 ให้ครบตามขนาด
  return hexEPC.padEnd(hexLength, "0");
}

/**
 * Decode ASCII EPC back to item number
 * รองรับทุกขนาด EPC
 * 
 * @param {string} epc - Hex encoded EPC
 * @returns {string} Decoded item number
 * 
 * @example
 * decodeASCIIEPC("504B2D31392D31352D3534303134302D41424344") 
 * → "PK-19-15-540140-ABCD"
 */
export function decodeASCIIEPC(epc) {
  if (!epc) return "";
  
  let result = "";
  
  // แปลงทีละ 2 characters (1 byte)
  for (let i = 0; i < epc.length; i += 2) {
    const hex = epc.substring(i, i + 2);
    const charCode = parseInt(hex, 16);
    
    // หยุดถ้าเจอ 00 (padding)
    if (charCode === 0) break;
    
    // เฉพาะ printable ASCII (32-126)
    if (charCode >= 32 && charCode <= 126) {
      result += String.fromCharCode(charCode);
    }
  }
  
  return result;
}

// ========== EPC Size Constants ==========
export const EPC_SIZES = {
  EPC_96:  { bits: 96,  bytes: 12, hexLength: 24,  maxChars: 12 },
  EPC_128: { bits: 128, bytes: 16, hexLength: 32,  maxChars: 16 },
  EPC_160: { bits: 160, bytes: 20, hexLength: 40,  maxChars: 20 },
  EPC_256: { bits: 256, bytes: 32, hexLength: 64,  maxChars: 32 },
  EPC_496: { bits: 496, bytes: 62, hexLength: 124, maxChars: 62 },
};

// ========== Helper Functions ==========
function getNextSerial() {
  serialCounter++;
  return Date.now().toString().slice(-10) + serialCounter.toString().padStart(4, "0");
}

/**
 * ตรวจสอบว่า item number ต้องใช้ EPC กี่ bits
 * @param {string} itemNumber 
 * @returns {number} bits needed
 */
export function getRequiredEPCBits(itemNumber) {
  const length = itemNumber.length;
  
  if (length <= 12) return 96;
  if (length <= 16) return 128;
  if (length <= 20) return 160;
  if (length <= 32) return 256;
  return 496;
}

// ========== Main EPC Service ==========
export const EPCService = {
  /**
   * Generate EPC from item
   * @param {Object} item - Item object with number property
   * @param {Object} options - Options including mode, bits, prefix
   * @returns {string} Generated EPC hex string
   */
  generate(item, options = {}) {
    const mode = options.mode || EPC_CONFIG.mode;
    const prefix = options.prefix || EPC_CONFIG.prefix;
    const companyPrefix = options.companyPrefix || EPC_CONFIG.companyPrefix;
    
    // Default 96-bit เพื่อให้ใช้ได้กับทุก tag
    const bits = options.bits || 96;

    switch (mode) {
      case "sgtin96":
        return generateSGTIN96({
          companyPrefix,
          itemRef: item.number.replace(/\D/g, "").slice(-6),
          serial: item.serial || getNextSerial(),
        });

      case "unique":
        return generateUniqueEPC({ prefix });

      case "ascii":
        // ย่อ item number ก่อนถ้าจำเป็น
        const maxChars = Math.floor(bits / 8);
        const compactNum = compactItemNumber(item.number, maxChars);
        return generateASCIIEPC(compactNum, bits);

      case "simple":
      default:
        return generateSimpleEPC({
          prefix,
          itemNumber: item.number,
          sequence: item.serial || getNextSerial(),
        });
    }
  },

  /**
   * Decode EPC back to item number
   * @param {string} epc - Hex encoded EPC
   * @param {string} mode - Decode mode (ascii, simple, etc.)
   * @param {boolean} expand - ถ้า true จะขยาย item number กลับ (เช่น PK1915540140 → PK-19-15-540140)
   * @returns {string} Decoded item number
   */
  decode(epc, mode = "ascii", expand = true) {
    if (!epc) return "";
    
    switch (mode) {
      case "ascii": {
        const decoded = decodeASCIIEPC(epc);
        return expand ? expandItemNumber(decoded) : decoded;
      }
      
      case "simple":
        // Simple mode ไม่สามารถ decode กลับได้เต็ม
        return `[Simple EPC: ${epc}]`;
      
      default: {
        // ลอง decode แบบ ASCII ก่อน
        const decoded = decodeASCIIEPC(epc);
        if (decoded) {
          return expand ? expandItemNumber(decoded) : decoded;
        }
        return epc;
      }
    }
  },

  /**
   * Validate EPC format
   * @param {string} epc - EPC to validate
   * @param {number} expectedBits - Expected EPC size in bits
   * @returns {Object} Validation result
   */
  validate(epc, expectedBits = null) {
    if (!epc || typeof epc !== "string") {
      return { valid: false, error: "EPC is required" };
    }
    if (!/^[0-9A-Fa-f]+$/.test(epc)) {
      return { valid: false, error: "EPC must be hexadecimal" };
    }
    
    // รองรับหลายขนาด
    const validLengths = [24, 32, 40, 64, 124]; // 96, 128, 160, 256, 496 bits
    
    if (expectedBits) {
      const expectedLength = expectedBits / 4;
      if (epc.length !== expectedLength) {
        return { 
          valid: false, 
          error: `EPC should be ${expectedLength} hex chars for ${expectedBits}-bit` 
        };
      }
    }
    
    return { valid: true, bits: epc.length * 4 };
  },

  /**
   * Parse EPC and extract information
   * @param {string} epc - EPC to parse
   * @returns {Object} Parsed EPC information
   */
  parse(epc) {
    if (!epc) return null;

    const bits = epc.length * 4;
    const header = epc.substring(0, 2).toUpperCase();
    
    const types = {
      "30": "SGTIN-96",
      "31": "SGTIN-198",
      "35": "SSCC-96",
      "36": "GRAI-96",
      "E2": "Custom/Proprietary",
    };

    // ลอง decode ถ้าเป็น ASCII
    let decoded = null;
    try {
      decoded = decodeASCIIEPC(epc);
      // เช็คว่า decoded ออกมาเป็น printable text หรือไม่
      if (decoded && !/^[\x20-\x7E]+$/.test(decoded)) {
        decoded = null;
      }
    } catch {
      decoded = null;
    }

    return {
      raw: epc,
      header,
      type: types[header] || "ASCII/Custom",
      bits,
      bytes: bits / 8,
      hexLength: epc.length,
      decoded, // Item number ถ้า decode ได้
      uri: `urn:epc:tag:${epc}`,
    };
  },

  /**
   * Get EPC size info
   * @param {number} bits - EPC size in bits
   * @returns {Object} Size information
   */
  getSizeInfo(bits) {
    return EPC_SIZES[`EPC_${bits}`] || EPC_SIZES.EPC_160;
  },

  /**
   * Reset serial counter
   */
  resetCounter() {
    serialCounter = 0;
  },
};

export default EPCService;