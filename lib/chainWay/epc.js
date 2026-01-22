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
 * ย่อ item number ให้พอดี maxLength ตัวอักษร
 * ลบ "-" ออก และตัดให้เหลือตามที่กำหนด
 * 
 * @example
 * compactItemNumber("PK-19-15-540140", 12) → "PK1915540140" (12 ตัว)
 * compactItemNumber("PK-19-15-540140", 10) → "PK19155401" (10 ตัว)
 */
export function compactItemNumber(itemNumber, maxLength = 12) {
  let compact = itemNumber.replace(/-/g, "");
  
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
  
  // ลบ trailing zeros ที่เป็น padding
  compact = compact.replace(/0+$/, "");
  
  // ลอง pattern: XX-99-99-999999 (prefix 2 + groups of 2-2-6+)
  const match = compact.match(/^([A-Z]{2})(\d{2})(\d{2})(\d+)$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}-${match[4]}`;
  }
  
  return compact;
}

// ========== ASCII EPC ==========
/**
 * Generate EPC from item number as ASCII hex
 * 
 * @param {string} itemNumber - Item number to encode
 * @param {number} bits - EPC size in bits (default: 96)
 * @returns {string} Hex encoded EPC
 */
export function generateASCIIEPC(itemNumber, bits = 96) {
  const bytes = Math.floor(bits / 8);
  const hexLength = bytes * 2;
  const trimmed = itemNumber.substring(0, bytes);
  
  let hexEPC = "";
  for (let i = 0; i < trimmed.length; i++) {
    hexEPC += trimmed.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
  }
  
  return hexEPC.padEnd(hexLength, "0");
}

/**
 * Decode ASCII EPC back to item number
 */
export function decodeASCIIEPC(epc) {
  if (!epc) return "";
  
  let result = "";
  
  for (let i = 0; i < epc.length; i += 2) {
    const hex = epc.substring(i, i + 2);
    const charCode = parseInt(hex, 16);
    
    if (charCode === 0) break;
    
    if (charCode >= 32 && charCode <= 126) {
      result += String.fromCharCode(charCode);
    }
  }
  
  return result;
}

// ========== ASCII EPC with Sequence ==========
/**
 * Generate ASCII EPC with sequence number
 * Format: ITEM_COMPACT + SEQ (2 หลัก)
 * 
 * 96-bit = 12 chars = 10 chars item + 2 chars sequence
 * 
 * @param {string} itemNumber - Item number (will be compacted)
 * @param {number} sequenceNumber - Sequence number (1-99)
 * @param {number} bits - EPC size in bits (default: 96)
 * @returns {string} Hex encoded EPC
 * 
 * @example
 * generateASCIIEPCWithSequence("PK-19-15-540140", 1, 96)
 * → "504B3139313535343031303100" (PK19155401 + "01")
 */
export function generateASCIIEPCWithSequence(itemNumber, sequenceNumber, bits = 96) {
  const bytes = Math.floor(bits / 8); // 12 for 96-bit
  const seqLength = 2; // 2 chars for sequence (01-99)
  const maxItemLength = bytes - seqLength; // 10 chars for item
  
  // ย่อ item number
  const compactItem = compactItemNumber(itemNumber, maxItemLength);
  
  // เพิ่ม sequence number (2 หลัก)
  const seqStr = sequenceNumber.toString().padStart(seqLength, "0");
  const fullCode = compactItem.padEnd(maxItemLength, "0") + seqStr;
  
  // แปลงเป็น ASCII hex
  let hexEPC = "";
  for (let i = 0; i < fullCode.length; i++) {
    hexEPC += fullCode.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
  }
  
  return hexEPC.padEnd(bytes * 2, "0");
}

/**
 * Decode ASCII EPC with sequence back to item number and sequence
 * 
 * @param {string} epc - Hex encoded EPC
 * @returns {Object} { itemNumber, sequence, compact, raw }
 */
export function decodeASCIIEPCWithSequence(epc) {
  const decoded = decodeASCIIEPC(epc);
  if (!decoded || decoded.length < 3) {
    return { itemNumber: decoded, sequence: null, compact: decoded, raw: decoded };
  }
  
  // แยก sequence (2 ตัวท้าย)
  const seqStr = decoded.slice(-2);
  const itemCompact = decoded.slice(0, -2).replace(/0+$/, ""); // ลบ padding 0 ท้าย
  
  const sequence = parseInt(seqStr, 10);
  const itemNumber = expandItemNumber(itemCompact);
  
  return {
    itemNumber,
    sequence: isNaN(sequence) ? null : sequence,
    compact: itemCompact,
    raw: decoded,
  };
}

// ========== EPC Size Constants ==========
export const EPC_SIZES = {
  EPC_96:  { bits: 96,  bytes: 12, hexLength: 24,  maxChars: 12, maxItemChars: 10 },
  EPC_128: { bits: 128, bytes: 16, hexLength: 32,  maxChars: 16, maxItemChars: 14 },
  EPC_160: { bits: 160, bytes: 20, hexLength: 40,  maxChars: 20, maxItemChars: 18 },
  EPC_256: { bits: 256, bytes: 32, hexLength: 64,  maxChars: 32, maxItemChars: 30 },
  EPC_496: { bits: 496, bytes: 62, hexLength: 124, maxChars: 62, maxItemChars: 60 },
};

// ========== Helper Functions ==========
function getNextSerial() {
  serialCounter++;
  return Date.now().toString().slice(-10) + serialCounter.toString().padStart(4, "0");
}

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
   */
  generate(item, options = {}) {
    const mode = options.mode || EPC_CONFIG.mode;
    const prefix = options.prefix || EPC_CONFIG.prefix;
    const companyPrefix = options.companyPrefix || EPC_CONFIG.companyPrefix;
    const bits = options.bits || 96;
    const sequenceNumber = options.sequenceNumber || null;

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
        if (sequenceNumber !== null && sequenceNumber !== undefined) {
          return generateASCIIEPCWithSequence(item.number, sequenceNumber, bits);
        }
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
   * Generate multiple EPCs with sequence numbers
   * สำหรับพิมพ์หลายใบ เช่น 1/3, 2/3, 3/3
   */
  generateBatch(item, quantity, options = {}) {
    const results = [];
    
    for (let i = 1; i <= quantity; i++) {
      const epc = this.generate(item, {
        ...options,
        mode: "ascii",
        sequenceNumber: i,
      });
      
      results.push({
        epc,
        sequenceNumber: i,
        totalQuantity: quantity,
        sequenceText: `${i}/${quantity}`,
      });
    }
    
    return results;
  },

  /**
   * Decode EPC back to item number
   */
  decode(epc, mode = "ascii", expand = true) {
    if (!epc) return "";
    
    switch (mode) {
      case "ascii": {
        const decoded = decodeASCIIEPC(epc);
        return expand ? expandItemNumber(decoded) : decoded;
      }
      
      case "ascii-seq": {
        return decodeASCIIEPCWithSequence(epc);
      }
      
      case "simple":
        return `[Simple EPC: ${epc}]`;
      
      default: {
        const decoded = decodeASCIIEPC(epc);
        if (decoded) {
          return expand ? expandItemNumber(decoded) : decoded;
        }
        return epc;
      }
    }
  },

  validate(epc, expectedBits = null) {
    if (!epc || typeof epc !== "string") {
      return { valid: false, error: "EPC is required" };
    }
    if (!/^[0-9A-Fa-f]+$/.test(epc)) {
      return { valid: false, error: "EPC must be hexadecimal" };
    }
    
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

    let decoded = null;
    let decodedWithSeq = null;
    try {
      decoded = decodeASCIIEPC(epc);
      if (decoded && /^[\x20-\x7E]+$/.test(decoded)) {
        decodedWithSeq = decodeASCIIEPCWithSequence(epc);
      } else {
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
      decoded,
      decodedWithSeq,
      uri: `urn:epc:tag:${epc}`,
    };
  },

  getSizeInfo(bits) {
    return EPC_SIZES[`EPC_${bits}`] || EPC_SIZES.EPC_96;
  },

  resetCounter() {
    serialCounter = 0;
  },
};

export default EPCService;