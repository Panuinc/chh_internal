import { ZPL_CONFIG, DEFAULT_LABEL_SIZE } from "./config.js";
import { mmToDots, sanitizeText } from "./utils.js";

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
    labelSize = DEFAULT_LABEL_SIZE,
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
    labelSize = DEFAULT_LABEL_SIZE,
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

export async function buildThaiRFIDLabel(options) {
  const {
    itemNumber,
    displayName,
    displayName2 = "",
    epcData,
    quantity = 1,
    labelSize = DEFAULT_LABEL_SIZE,
  } = options;

  const w = mmToDots(labelSize.width);
  const h = mmToDots(labelSize.height);
  const usableWidth = w - PAD.left - PAD.right;
  const usableHeight = h - PAD.top - PAD.bottom;

  const nameGraphic = await textToGraphic(displayName, {
    fontSize: 32,
    maxWidth: usableWidth - 200,
  });

  const name2Graphic = displayName2
    ? await textToGraphic(displayName2, {
        fontSize: 26,
        maxWidth: usableWidth - 200,
      })
    : null;

  let zpl = `^XA^JUS^XZ^XA^MMT^PW${w}^LL${h}`;

  if (epcData) {
    zpl += `^RS8^RFW,H,1,12,1^FD${epcData}^FS`;
  }

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

  zpl += `^FO${w - PAD.right - 180},${PAD.top + Math.round((usableHeight - 85) / 2)}^A0N,85,85^FDRFID^FS`;

  zpl += `^PQ${quantity}^XZ`;

  return zpl;
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
  RFID_CALIBRATE: "^HR",
  RFID_TEST: "^RT",
  FEED_LABEL: "~TA000",
  PAUSE: "~PP",
  RESUME: "~PS",
  SAVE_CONFIG: "^XA^JUS^XZ",
};

export default {
  textToGraphic,
  buildThaiQRLabel,
  buildThaiLabel,
  buildThaiRFIDLabel,
  PrinterCommands,
};
