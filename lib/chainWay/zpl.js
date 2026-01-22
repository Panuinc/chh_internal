import { ZPL_CONFIG, LABEL_SIZES } from "./config.js";
import { mmToDots, sanitizeText } from "./utils.js";
import { generateASCIIEPCWithSequence, compactItemNumber } from "./epc.js";

const PAD = {
  top: mmToDots(ZPL_CONFIG.padding.top),
  bottom: mmToDots(ZPL_CONFIG.padding.bottom),
  left: mmToDots(ZPL_CONFIG.padding.left),
  right: mmToDots(ZPL_CONFIG.padding.right),
};

export async function textToGraphic(text, options = {}) {
  const { fontSize = 32, maxWidth = 800 } = options;

  try {
    const { createCanvas } = await import("canvas");

    const measureCanvas = createCanvas(1, 1);
    const measureCtx = measureCanvas.getContext("2d");
    measureCtx.font = `${fontSize}px Arial, Tahoma, "Noto Sans Thai", sans-serif`;
    const metrics = measureCtx.measureText(text);

    const textWidth = Math.min(Math.ceil(metrics.width) + 10, maxWidth);
    const textHeight = fontSize + 10;

    const canvas = createCanvas(textWidth, textHeight);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, textWidth, textHeight);

    ctx.fillStyle = "black";
    ctx.font = `${fontSize}px Arial, Tahoma, "Noto Sans Thai", sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillText(text, 5, textHeight / 2);

    const imageData = ctx.getImageData(0, 0, textWidth, textHeight);
    const { data, width, height } = imageData;

    const bytesPerRow = Math.ceil(width / 8);
    const totalBytes = bytesPerRow * height;
    const bitmapData = new Uint8Array(totalBytes);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const isBlack =
          (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3 <
          128;

        if (isBlack) {
          const byteIndex = y * bytesPerRow + Math.floor(x / 8);
          bitmapData[byteIndex] |= 1 << (7 - (x % 8));
        }
      }
    }

    let hexData = "";
    for (let i = 0; i < bitmapData.length; i++) {
      hexData += bitmapData[i].toString(16).padStart(2, "0").toUpperCase();
    }

    return {
      command: `^GFA,${totalBytes},${totalBytes},${bytesPerRow},${hexData}`,
      width,
      height,
    };
  } catch (error) {
    console.error("[ZPL] Text to graphic conversion failed:", error.message);
    return null;
  }
}

export async function buildThaiQRLabel(options) {
  const {
    itemNumber,
    displayName,
    displayName2 = "",
    qrData,
    quantity = 1,
    labelSize = LABEL_SIZES.STANDARD,
  } = options;

  const w = mmToDots(labelSize.width);
  const h = mmToDots(labelSize.height);
  const usableWidth = w - PAD.left - PAD.right;
  const usableHeight = h - PAD.top - PAD.bottom;

  const nameGraphic = await textToGraphic(displayName, {
    fontSize: 32,
    maxWidth: usableWidth - 220,
  });
  const name2Graphic = displayName2
    ? await textToGraphic(displayName2, {
        fontSize: 26,
        maxWidth: usableWidth - 220,
      })
    : null;

  let zpl = `^XA^JUS^XZ^XA^MMT^PW${w}^LL${h}`;
  zpl += `^FO${PAD.left},${PAD.top}^A0N,45,45^FD${sanitizeText(itemNumber, 30)}^FS`;

  if (nameGraphic) {
    zpl += `^FO${PAD.left},${h - PAD.bottom - 90}${nameGraphic.command}^FS`;
  } else {
    zpl += `^FO${PAD.left},${h - PAD.bottom - 90}^A0N,38,38^FD${sanitizeText(displayName, 40)}^FS`;
  }

  if (name2Graphic) {
    zpl += `^FO${PAD.left},${h - PAD.bottom - 45}${name2Graphic.command}^FS`;
  } else if (displayName2) {
    zpl += `^FO${PAD.left},${h - PAD.bottom - 45}^A0N,32,32^FD${sanitizeText(displayName2, 40)}^FS`;
  }

  const qrSize = 200;
  zpl += `^FO${w - PAD.right - qrSize},${PAD.top + Math.round((usableHeight - qrSize) / 2)}^BQN,2,6^FDQA,${qrData || itemNumber}^FS`;
  zpl += `^PQ${quantity}^XZ`;

  return zpl;
}

export async function buildThaiLabel(options) {
  const {
    itemNumber,
    displayName,
    displayName2 = "",
    barcodeData,
    quantity = 1,
    labelSize = LABEL_SIZES.STANDARD,
  } = options;

  const w = mmToDots(labelSize.width);
  const h = mmToDots(labelSize.height);
  const usableWidth = w - PAD.left - PAD.right;

  const nameGraphic = await textToGraphic(displayName, {
    fontSize: 28,
    maxWidth: usableWidth,
  });
  const name2Graphic = displayName2
    ? await textToGraphic(displayName2, { fontSize: 24, maxWidth: usableWidth })
    : null;

  let zpl = `^XA^JUS^XZ^XA^MMT^PW${w}^LL${h}`;
  zpl += `^FO${PAD.left},${PAD.top}^A0N,40,40^FD${sanitizeText(itemNumber, 35)}^FS`;
  zpl += `^FO${PAD.left},${PAD.top + 50}^BY2,2,90^BCN,,Y,N^FD${barcodeData || itemNumber}^FS`;

  if (nameGraphic) {
    zpl += `^FO${PAD.left},${h - PAD.bottom - 70}${nameGraphic.command}^FS`;
  } else {
    zpl += `^FO${PAD.left},${h - PAD.bottom - 70}^A0N,32,32^FD${sanitizeText(displayName, 45)}^FS`;
  }

  if (name2Graphic) {
    zpl += `^FO${PAD.left},${h - PAD.bottom - 35}${name2Graphic.command}^FS`;
  } else if (displayName2) {
    zpl += `^FO${PAD.left},${h - PAD.bottom - 35}^A0N,28,28^FD${sanitizeText(displayName2, 45)}^FS`;
  }

  zpl += `^PQ${quantity}^XZ`;
  return zpl;
}

/**
 * Build RFID Label with UHF Tag (Single Label)
 */
export async function buildThaiRFIDLabel(options) {
  const {
    itemNumber,
    displayName,
    displayName2 = "",
    epcData,
    quantity = 1,
    labelSize = LABEL_SIZES.RFID,
  } = options;

  const w = mmToDots(labelSize.width);
  const h = mmToDots(labelSize.height);
  
  const padLeft = mmToDots(2);
  const padTop = mmToDots(1);
  const padRight = mmToDots(2);
  
  const usableWidth = w - padLeft - padRight;

  let zpl = `^XA^MMT^PW${w}^LL${h}^CI28`;

  // RFID Commands
  if (epcData) {
    zpl += `^RS8`;
    zpl += `^RFW,H,,,A^FD${epcData}^FS`;
  }

  // Row 1: Item Number + UHF indicator
  const row1Y = padTop;
  zpl += `^FO${padLeft},${row1Y}^A0N,32,32^FD${sanitizeText(itemNumber, 20)}^FS`;
  
  const rfidBoxW = mmToDots(10);
  const rfidBoxH = mmToDots(5);
  const rfidBoxX = w - padRight - rfidBoxW;
  zpl += `^FO${rfidBoxX},${row1Y}^GB${rfidBoxW},${rfidBoxH},2^FS`;
  zpl += `^FO${rfidBoxX + mmToDots(1.5)},${row1Y + mmToDots(0.8)}^A0N,26,26^FDUHF^FS`;

  // Row 2: Display Name (Thai)
  const row2Y = padTop + mmToDots(5.5);
  const nameGraphic = await textToGraphic(displayName, {
    fontSize: 22,
    maxWidth: usableWidth,
  });
  if (nameGraphic) {
    zpl += `^FO${padLeft},${row2Y}${nameGraphic.command}^FS`;
  } else {
    zpl += `^FO${padLeft},${row2Y}^A0N,26,26^FD${sanitizeText(displayName, 30)}^FS`;
  }

  // Row 3: Barcode
  const row3Y = padTop + mmToDots(9.5);
  const barcodeHeight = mmToDots(5);
  zpl += `^FO${padLeft},${row3Y}^BY1,2,${barcodeHeight}^BCN,${barcodeHeight},N,N,N^FD${itemNumber}^FS`;

  // Row 4: EPC display
  if (epcData) {
    const row4Y = padTop + mmToDots(16);
    const formattedEPC = epcData.match(/.{1,2}/g)?.join(' ') || epcData;
    zpl += `^FO${padLeft},${row4Y}^A0N,16,16^FD${formattedEPC}^FS`;
  }

  zpl += `^PQ${quantity}^XZ`;
  return zpl;
}

/**
 * Build RFID Label with Sequence Number (1/3, 2/3, etc.)
 * 
 * @param {Object} options - Label options
 * @param {string} options.itemNumber - Item number
 * @param {string} options.displayName - Display name (Thai)
 * @param {number} options.sequenceNumber - Current sequence (1, 2, 3...)
 * @param {number} options.totalQuantity - Total quantity (3)
 * @param {Object} options.labelSize - Label size
 * @returns {string} ZPL command
 */
export async function buildThaiRFIDLabelWithSequence(options) {
  const {
    itemNumber,
    displayName,
    displayName2 = "",
    sequenceNumber,
    totalQuantity,
    labelSize = LABEL_SIZES.RFID,
  } = options;

  const w = mmToDots(labelSize.width);
  const h = mmToDots(labelSize.height);
  
  const padLeft = mmToDots(2);
  const padTop = mmToDots(1);
  const padRight = mmToDots(2);
  
  const usableWidth = w - padLeft - padRight;
  const sequenceText = `${sequenceNumber}/${totalQuantity}`;

  // Generate EPC with sequence
  const epcData = generateASCIIEPCWithSequence(itemNumber, sequenceNumber, 96);

  let zpl = `^XA^MMT^PW${w}^LL${h}^CI28`;

  // RFID Commands
  zpl += `^RS8`;
  zpl += `^RFW,H,,,A^FD${epcData}^FS`;

  // Row 1: Item Number + Sequence + UHF indicator
  const row1Y = padTop;
  const itemWithSeq = `${itemNumber} (${sequenceText})`;
  
  // ถ้ายาวเกินไป ให้แสดงแยกบรรทัด
  if (itemWithSeq.length > 22) {
    zpl += `^FO${padLeft},${row1Y}^A0N,26,26^FD${sanitizeText(itemNumber, 18)}^FS`;
    // แสดง sequence ถัดจาก item number
    const seqX = padLeft + mmToDots(45);
    zpl += `^FO${seqX},${row1Y}^A0N,26,26^FD(${sequenceText})^FS`;
  } else {
    zpl += `^FO${padLeft},${row1Y}^A0N,28,28^FD${sanitizeText(itemWithSeq, 22)}^FS`;
  }
  
  // UHF indicator box
  const rfidBoxW = mmToDots(10);
  const rfidBoxH = mmToDots(5);
  const rfidBoxX = w - padRight - rfidBoxW;
  zpl += `^FO${rfidBoxX},${row1Y}^GB${rfidBoxW},${rfidBoxH},2^FS`;
  zpl += `^FO${rfidBoxX + mmToDots(1.5)},${row1Y + mmToDots(0.8)}^A0N,26,26^FDUHF^FS`;

  // Row 2: Display Name (Thai)
  const row2Y = padTop + mmToDots(5.5);
  const nameGraphic = await textToGraphic(displayName, {
    fontSize: 20,
    maxWidth: usableWidth,
  });
  if (nameGraphic) {
    zpl += `^FO${padLeft},${row2Y}${nameGraphic.command}^FS`;
  } else {
    zpl += `^FO${padLeft},${row2Y}^A0N,24,24^FD${sanitizeText(displayName, 28)}^FS`;
  }

  // Row 3: Barcode with sequence
  const row3Y = padTop + mmToDots(9.5);
  const barcodeHeight = mmToDots(5);
  const barcodeData = `${compactItemNumber(itemNumber, 10)}-${sequenceNumber}`;
  zpl += `^FO${padLeft},${row3Y}^BY1,2,${barcodeHeight}^BCN,${barcodeHeight},N,N,N^FD${barcodeData}^FS`;

  // Row 4: EPC display
  const row4Y = padTop + mmToDots(16);
  const formattedEPC = epcData.match(/.{1,2}/g)?.join(' ') || epcData;
  zpl += `^FO${padLeft},${row4Y}^A0N,14,14^FD${formattedEPC}^FS`;

  zpl += `^PQ1^XZ`;
  return zpl;
}

/**
 * Build multiple RFID Labels with sequence numbers
 * สำหรับพิมพ์หลายใบ เช่น 1/3, 2/3, 3/3
 * 
 * @param {Object} options - Label options
 * @param {string} options.itemNumber - Item number
 * @param {string} options.displayName - Display name
 * @param {number} options.quantity - จำนวนที่ต้องพิมพ์
 * @returns {Promise<Array>} Array of { zpl, sequenceNumber, sequenceText, epc }
 */
export async function buildThaiRFIDLabels(options) {
  const {
    itemNumber,
    displayName,
    displayName2 = "",
    quantity = 1,
    labelSize = LABEL_SIZES.RFID,
  } = options;

  const labels = [];

  for (let i = 1; i <= quantity; i++) {
    const zpl = await buildThaiRFIDLabelWithSequence({
      itemNumber,
      displayName,
      displayName2,
      sequenceNumber: i,
      totalQuantity: quantity,
      labelSize,
    });
    
    const epc = generateASCIIEPCWithSequence(itemNumber, i, 96);
    
    labels.push({
      zpl,
      sequenceNumber: i,
      totalQuantity: quantity,
      sequenceText: `${i}/${quantity}`,
      epc,
    });
  }

  return labels;
}

export const PrinterCommands = {
  HOST_STATUS: "~HS",
  HOST_IDENTIFICATION: "~HI",
  CANCEL_ALL: "~JA",
  CANCEL_CURRENT: "~JX",
  CLEAR_BUFFER: "^XA^MCY^XZ",
  RESET_PRINTER: "~JR",
  RESET_NETWORK: "~WR",
  POWER_ON_RESET: "~JP",
  RESTORE_DEFAULTS: "^JUF",
  CALIBRATE_MEDIA: "~JC",
  CALIBRATE_RIBBON: "~JB",
  RFID_CALIBRATE: "^XA^HR^XZ",
  RFID_TEST: "~RT",
  FEED_LABEL: "~TA000",
  PAUSE: "~PP",
  RESUME: "~PS",
  SAVE_CONFIG: "^XA^JUS^XZ",
};