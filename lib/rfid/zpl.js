const DEFAULT_LABEL = { width: 100, height: 80 };
const DOTS_PER_MM = 11.8;

function mmToDots(mm) {
  return Math.round(mm * DOTS_PER_MM);
}

function sanitizeText(text, maxLen = 35) {
  return (text || "").substring(0, maxLen);
}

export async function textToGraphic(text, options = {}) {
  const { fontSize = 40, maxWidth = 1000 } = options;

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
        const isBlack = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3 < 128;

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
    console.error("[ZPL] Thai text conversion failed:", error.message);
    return null;
  }
}

export function buildBarcodeLabel(options) {
  const {
    itemNumber,
    displayName,
    displayName2 = "",
    barcodeData,
    quantity = 1,
    labelSize = DEFAULT_LABEL,
  } = options;

  const w = mmToDots(labelSize.width);
  const h = mmToDots(labelSize.height);
  const margin = 50;

  let zpl = `^XA^JUS^XZ^XA^MMT^PW${w}^LL${h}`;
  zpl += `^FO${margin},50^A0N,70,70^FD${sanitizeText(itemNumber)}^FS`;
  zpl += `^FO${margin},140^A0N,50,50^FD${sanitizeText(displayName)}^FS`;

  if (displayName2) {
    zpl += `^FO${margin},210^A0N,40,40^FD${sanitizeText(displayName2, 40)}^FS`;
  }

  zpl += `^FO${margin},350^BY3,3,150^BCN,,Y,N^FD${barcodeData || itemNumber}^FS`;
  zpl += `^PQ${quantity}^XZ`;

  return zpl;
}

export function buildRFIDLabel(options) {
  const {
    epcData,
    itemNumber,
    displayName,
    displayName2 = "",
    barcodeData,
    quantity = 1,
    labelSize = DEFAULT_LABEL,
  } = options;

  const w = mmToDots(labelSize.width);
  const h = mmToDots(labelSize.height);
  const margin = 50;

  let zpl = `^XA^JUS^XZ^XA^MMT^PW${w}^LL${h}`;

  if (epcData) {
    zpl += `^RS8^RFW,H,1,12,1^FD${epcData}^FS`;
  }

  zpl += `^FO${margin},50^A0N,70,70^FD${sanitizeText(itemNumber)}^FS`;
  zpl += `^FO${margin},140^A0N,50,50^FD${sanitizeText(displayName)}^FS`;

  if (displayName2) {
    zpl += `^FO${margin},210^A0N,40,40^FD${sanitizeText(displayName2, 40)}^FS`;
  }

  zpl += `^FO${margin},350^BY3,3,150^BCN,,Y,N^FD${barcodeData || itemNumber}^FS`;
  zpl += `^PQ${quantity}^XZ`;

  return zpl;
}

export function buildQRLabel(options) {
  const {
    itemNumber,
    displayName,
    qrData,
    epcData,
    quantity = 1,
    labelSize = DEFAULT_LABEL,
  } = options;

  const w = mmToDots(labelSize.width);
  const h = mmToDots(labelSize.height);
  const margin = 50;

  let zpl = `^XA^JUS^XZ^XA^MMT^PW${w}^LL${h}`;

  if (epcData) {
    zpl += `^RS8^RFW,H,1,12,1^FD${epcData}^FS`;
  }

  zpl += `^FO${margin},50^A0N,60,60^FD${sanitizeText(itemNumber)}^FS`;
  zpl += `^FO${margin},130^A0N,45,45^FD${sanitizeText(displayName)}^FS`;

  zpl += `^FO${w - 280},50^BQN,2,6^FDQA,${qrData || itemNumber}^FS`;

  zpl += `^PQ${quantity}^XZ`;

  return zpl;
}

export async function buildThaiLabel(options) {
  const {
    itemNumber,
    displayName,
    displayName2 = "",
    barcodeData,
    epcData,
    quantity = 1,
    labelSize = DEFAULT_LABEL,
  } = options;

  const w = mmToDots(labelSize.width);
  const h = mmToDots(labelSize.height);
  const margin = 50;

  const nameGraphic = await textToGraphic(displayName, { fontSize: 45 });
  const name2Graphic = displayName2 ? await textToGraphic(displayName2, { fontSize: 35 }) : null;

  let zpl = `^XA^JUS^XZ^XA^MMT^PW${w}^LL${h}`;

  if (epcData) {
    zpl += `^RS8^RFW,H,1,12,1^FD${epcData}^FS`;
  }

  zpl += `^FO${margin},50^A0N,70,70^FD${sanitizeText(itemNumber)}^FS`;

  if (nameGraphic) {
    zpl += `^FO${margin},140${nameGraphic.command}^FS`;
  } else {
    zpl += `^FO${margin},140^A0N,50,50^FD${sanitizeText(displayName)}^FS`;
  }

  if (name2Graphic) {
    zpl += `^FO${margin},220${name2Graphic.command}^FS`;
  } else if (displayName2) {
    zpl += `^FO${margin},220^A0N,40,40^FD${sanitizeText(displayName2, 40)}^FS`;
  }

  zpl += `^FO${margin},380^BY3,3,150^BCN,,Y,N^FD${barcodeData || itemNumber}^FS`;
  zpl += `^PQ${quantity}^XZ`;

  return zpl;
}

export async function buildThaiQRLabel(options) {
  const {
    itemNumber,
    displayName,
    qrData,
    epcData,
    quantity = 1,
    labelSize = DEFAULT_LABEL,
  } = options;

  const w = mmToDots(labelSize.width);
  const h = mmToDots(labelSize.height);
  const margin = 50;

  const nameGraphic = await textToGraphic(displayName, { fontSize: 40 });

  let zpl = `^XA^JUS^XZ^XA^MMT^PW${w}^LL${h}`;

  if (epcData) {
    zpl += `^RS8^RFW,H,1,12,1^FD${epcData}^FS`;
  }

  zpl += `^FO${margin},50^A0N,60,60^FD${sanitizeText(itemNumber)}^FS`;

  if (nameGraphic) {
    zpl += `^FO${margin},130${nameGraphic.command}^FS`;
  } else {
    zpl += `^FO${margin},130^A0N,45,45^FD${sanitizeText(displayName)}^FS`;
  }

  zpl += `^FO${w - 280},50^BQN,2,6^FDQA,${qrData || itemNumber}^FS`;

  zpl += `^PQ${quantity}^XZ`;

  return zpl;
}

export const PrinterCommands = {
  status: "~HS",
  calibrate: "~JC",
  cancelAll: "~JA",
  reset: "~JR",
  saveConfig: "^XA^JUS^XZ",
  rfidRead: "^XA^RFR,H,0,12,1^FN1^FS^HV1,,EPC:^FS^XZ",
};

export default {
  textToGraphic,
  buildBarcodeLabel,
  buildRFIDLabel,
  buildQRLabel,
  buildThaiLabel,
  buildThaiQRLabel,
  PrinterCommands,
};