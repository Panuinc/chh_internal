const DEFAULT_LABEL = { width: 100, height: 30 };
const DOTS_PER_MM = 11.8;

function mmToDots(mm) {
  return Math.round(mm * DOTS_PER_MM);
}

function sanitizeText(text, maxLen = 40) {
  return (text || "").substring(0, maxLen);
}

export async function textToGraphic(text, options = {}) {
  const { fontSize = 28, maxWidth = 800 } = options;

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
          (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3 < 128;

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
    labelSize = DEFAULT_LABEL,
  } = options;

  const w = mmToDots(labelSize.width);
  const h = mmToDots(labelSize.height);

  const nameGraphic = await textToGraphic(displayName, {
    fontSize: 32,
    maxWidth: 850,
  });
  const name2Graphic = displayName2
    ? await textToGraphic(displayName2, { fontSize: 26, maxWidth: 850 })
    : null;

  let zpl = `^XA^JUS^XZ^XA^MMT^PW${w}^LL${h}`;

  zpl += `^FO25,15^A0N,45,45^FD${sanitizeText(itemNumber, 30)}^FS`;

  if (nameGraphic) {
    zpl += `^FO25,${h - 110}${nameGraphic.command}^FS`;
  } else {
    zpl += `^FO25,${h - 110}^A0N,38,38^FD${sanitizeText(displayName, 40)}^FS`;
  }

  if (name2Graphic) {
    zpl += `^FO25,${h - 60}${name2Graphic.command}^FS`;
  } else if (displayName2) {
    zpl += `^FO25,${h - 60}^A0N,32,32^FD${sanitizeText(displayName2, 40)}^FS`;
  }

  zpl += `^FO${w - 220},${Math.round((h - 200) / 2)}^BQN,2,6^FDQA,${qrData || itemNumber}^FS`;

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
    labelSize = DEFAULT_LABEL,
  } = options;

  const w = mmToDots(labelSize.width);
  const h = mmToDots(labelSize.height);

  const nameGraphic = await textToGraphic(displayName, {
    fontSize: 28,
    maxWidth: 1100,
  });
  const name2Graphic = displayName2
    ? await textToGraphic(displayName2, { fontSize: 24, maxWidth: 1100 })
    : null;

  let zpl = `^XA^JUS^XZ^XA^MMT^PW${w}^LL${h}`;

  zpl += `^FO25,10^A0N,40,40^FD${sanitizeText(itemNumber, 35)}^FS`;

  zpl += `^FO25,55^BY2,2,90^BCN,,Y,N^FD${barcodeData || itemNumber}^FS`;

  if (nameGraphic) {
    zpl += `^FO25,${h - 90}${nameGraphic.command}^FS`;
  } else {
    zpl += `^FO25,${h - 90}^A0N,32,32^FD${sanitizeText(displayName, 45)}^FS`;
  }

  if (name2Graphic) {
    zpl += `^FO25,${h - 50}${name2Graphic.command}^FS`;
  } else if (displayName2) {
    zpl += `^FO25,${h - 50}^A0N,28,28^FD${sanitizeText(displayName2, 45)}^FS`;
  }

  zpl += `^PQ${quantity}^XZ`;

  return zpl;
}

export async function buildThaiRFIDLabel(options) {
  const {
    itemNumber,
    displayName,
    displayName2 = "",
    epcData,
    quantity = 1,
    labelSize = DEFAULT_LABEL,
  } = options;

  const w = mmToDots(labelSize.width);
  const h = mmToDots(labelSize.height);

  const nameGraphic = await textToGraphic(displayName, {
    fontSize: 32,
    maxWidth: 850,
  });
  const name2Graphic = displayName2
    ? await textToGraphic(displayName2, { fontSize: 26, maxWidth: 850 })
    : null;

  let zpl = `^XA^JUS^XZ^XA^MMT^PW${w}^LL${h}`;

  if (epcData) {
    zpl += `^RS8^RFW,H,1,12,1^FD${epcData}^FS`;
  }

  zpl += `^FO25,15^A0N,45,45^FD${sanitizeText(itemNumber, 30)}^FS`;

  if (nameGraphic) {
    zpl += `^FO25,${h - 110}${nameGraphic.command}^FS`;
  } else {
    zpl += `^FO25,${h - 110}^A0N,38,38^FD${sanitizeText(displayName, 40)}^FS`;
  }

  if (name2Graphic) {
    zpl += `^FO25,${h - 60}${name2Graphic.command}^FS`;
  } else if (displayName2) {
    zpl += `^FO25,${h - 60}^A0N,32,32^FD${sanitizeText(displayName2, 40)}^FS`;
  }

  zpl += `^FO${w - 200},${Math.round((h - 100) / 2)}^A0N,85,85^FDRFID^FS`;

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
  buildThaiQRLabel,
  buildThaiLabel,
  buildThaiRFIDLabel,
  PrinterCommands,
  DEFAULT_LABEL,
};