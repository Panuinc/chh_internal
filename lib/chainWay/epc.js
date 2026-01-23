import { EPC_CONFIG } from "./config.js";

let serialCounter = 0;

export const EPC_SIZES = {
  EPC_96: { bits: 96, bytes: 12, hexLength: 24, maxChars: 12 },
  EPC_128: { bits: 128, bytes: 16, hexLength: 32, maxChars: 16 },
  EPC_192: { bits: 192, bytes: 24, hexLength: 48, maxChars: 24 },
  EPC_256: { bits: 256, bytes: 32, hexLength: 64, maxChars: 32 },
};

export function compactItemNumber(itemNumber, maxLength = 12) {
  let compact = itemNumber.replace(/-/g, "");
  if (compact.length > maxLength) {
    compact = compact.substring(0, maxLength);
  }
  return compact;
}

export function expandItemNumber(compact) {
  if (!compact || compact.length < 4) return compact;

  compact = compact.replace(/[\x00\s0]+$/, "").trim();

  const match = compact.match(/^([A-Z]{2})(\d{2})(\d{2})(\d+)$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}-${match[4]}`;
  }

  return compact;
}

export function generatePlainEPC(
  itemNumber,
  sequenceNumber,
  totalQuantity,
  bits = 96,
) {
  const bytes = Math.floor(bits / 8);

  const seqChar =
    sequenceNumber <= 9
      ? String(sequenceNumber)
      : String.fromCharCode(55 + sequenceNumber);

  const totalChar =
    totalQuantity <= 9
      ? String(totalQuantity)
      : String.fromCharCode(55 + totalQuantity);

  const itemMaxLen = bytes - 3;
  const compactItem = compactItemNumber(itemNumber, itemMaxLen);

  const paddedItem = compactItem.padEnd(itemMaxLen, " ");

  const fullString = `${paddedItem}/${seqChar}${totalChar}`;

  let hexEPC = "";
  for (let i = 0; i < fullString.length; i++) {
    hexEPC += fullString
      .charCodeAt(i)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");
  }

  return hexEPC.padEnd(bytes * 2, "00");
}

export function decodePlainEPC(epc) {
  if (!epc)
    return {
      itemNumber: "",
      sequence: null,
      total: null,
      sequenceText: "",
      raw: "",
    };

  let raw = "";
  for (let i = 0; i < epc.length; i += 2) {
    const hex = epc.substring(i, i + 2);
    const charCode = parseInt(hex, 16);
    if (charCode === 0) break;
    raw += String.fromCharCode(charCode);
  }

  const slashIndex = raw.lastIndexOf("/");
  if (slashIndex === -1 || slashIndex >= raw.length - 2) {
    const itemCompact = raw.trim();
    return {
      itemNumber: expandItemNumber(itemCompact),
      sequence: null,
      total: null,
      sequenceText: "",
      compact: itemCompact,
      raw,
    };
  }

  const itemCompact = raw.substring(0, slashIndex).trim();
  const seqChar = raw[slashIndex + 1];
  const totalChar = raw[slashIndex + 2];

  const sequence =
    seqChar >= "A" ? seqChar.charCodeAt(0) - 55 : parseInt(seqChar, 10);
  const total =
    totalChar >= "A" ? totalChar.charCodeAt(0) - 55 : parseInt(totalChar, 10);

  return {
    itemNumber: expandItemNumber(itemCompact),
    sequence,
    total,
    sequenceText: `${sequence}/${total}`,
    compact: itemCompact,
    raw,
  };
}

export function generateASCIIEPC(itemNumber, bits = 96) {
  const bytes = Math.floor(bits / 8);
  const trimmed = itemNumber.substring(0, bytes);

  let hexEPC = "";
  for (let i = 0; i < trimmed.length; i++) {
    hexEPC += trimmed.charCodeAt(i).toString(16).toUpperCase().padStart(2, "0");
  }

  return hexEPC.padEnd(bytes * 2, "00");
}

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

export function generateSimpleEPC({ prefix = "PK", itemNumber, sequence }) {
  const header = "E2";

  let prefixHex = "";
  for (let i = 0; i < Math.min(prefix.length, 4); i++) {
    prefixHex += prefix
      .charCodeAt(i)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");
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

export function generateUniqueEPC({ prefix = "UID" } = {}) {
  const timestamp = Date.now().toString(16).toUpperCase();
  const random = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .toUpperCase()
    .padStart(6, "0");

  let prefixHex = "";
  for (let i = 0; i < Math.min(prefix.length, 3); i++) {
    prefixHex += prefix
      .charCodeAt(i)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");
  }

  return ("E2" + prefixHex + timestamp + random).slice(0, 24).toUpperCase();
}

function getNextSerial() {
  serialCounter++;
  return (
    Date.now().toString().slice(-10) + serialCounter.toString().padStart(4, "0")
  );
}

export function getRequiredEPCBits(itemNumber) {
  const length = itemNumber.replace(/-/g, "").length;

  if (length <= 9) return 96;
  if (length <= 13) return 128;
  if (length <= 21) return 192;
  return 256;
}

export const EPCService = {
  generate(item, options = {}) {
    const {
      mode = "plain",
      sequenceNumber = 1,
      totalQuantity = 1,
      bits = 96,
      prefix = EPC_CONFIG.prefix,
      companyPrefix = EPC_CONFIG.companyPrefix,
    } = options;

    switch (mode) {
      case "sgtin96":
        return generateSGTIN96({
          companyPrefix,
          itemRef: item.number.replace(/\D/g, "").slice(-6),
          serial: item.serial || getNextSerial(),
        });

      case "unique":
        return generateUniqueEPC({ prefix });

      case "simple":
        return generateSimpleEPC({
          prefix,
          itemNumber: item.number,
          sequence: item.serial || getNextSerial(),
        });

      case "plain":
      default:
        return generatePlainEPC(
          item.number,
          sequenceNumber,
          totalQuantity,
          bits,
        );
    }
  },

  generateBatch(item, quantity, options = {}) {
    const results = [];

    for (let i = 1; i <= quantity; i++) {
      const epc = this.generate(item, {
        ...options,
        mode: "plain",
        sequenceNumber: i,
        totalQuantity: quantity,
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

  decode(epc, mode = "plain") {
    if (!epc) return "";

    switch (mode) {
      case "plain":
        return decodePlainEPC(epc);

      case "ascii":
        return {
          itemNumber: expandItemNumber(decodeASCIIEPC(epc)),
          raw: decodeASCIIEPC(epc),
        };

      default:
        return decodePlainEPC(epc);
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
          error: `EPC should be ${expectedLength} hex chars for ${expectedBits}-bit`,
        };
      }
    }

    return { valid: true, bits: epc.length * 4 };
  },

  parse(epc) {
    if (!epc) return null;

    const bits = epc.length * 4;
    const decoded = decodePlainEPC(epc);

    return {
      raw: epc,
      bits,
      bytes: bits / 8,
      hexLength: epc.length,
      decoded: decoded.raw,
      itemNumber: decoded.itemNumber,
      sequence: decoded.sequence,
      total: decoded.total,
      sequenceText: decoded.sequenceText,
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
