import { ZPL_CONFIG, LABEL_SIZES } from "./config.js";
import { mmToDots, sanitizeText } from "./utils.js";
import { generatePlainEPC } from "./epc.js";

const PAD = {
  top: mmToDots(2),
  bottom: mmToDots(2),
  left: mmToDots(2),
  right: mmToDots(2),
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
        const avgColor =
          (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;
        const isBlack = avgColor < 128;

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

export async function buildThaiRFIDLabel(options) {
  const {
    itemNumber,
    displayName,
    displayName2 = "",
    sequenceNumber = 1,
    totalQuantity = 1,
    epcData = null,
    labelSize = LABEL_SIZES.RFID,
  } = options;

  const w = mmToDots(labelSize.width);
  const h = mmToDots(labelSize.height);

  const usableWidth = w - PAD.left - PAD.right;
  const sequenceText =
    totalQuantity > 1 ? `${sequenceNumber}/${totalQuantity}` : "";

  const epc =
    epcData || generatePlainEPC(itemNumber, sequenceNumber, totalQuantity, 96);

  let zpl = `^XA^MMT^PW${w}^LL${h}^CI28`;

  zpl += `^RS8`;
  zpl += `^RFW,H,,,A^FD${epc}^FS`;

  const row1Y = PAD.top;
  const itemDisplay = sequenceText
    ? `${itemNumber} (${sequenceText})`
    : itemNumber;

  zpl += `^FO${PAD.left},${row1Y}^A0N,56,56^FD${sanitizeText(itemDisplay, 22)}^FS`;

  const row2Y = PAD.top + mmToDots(8);
  const nameGraphic = await textToGraphic(displayName, {
    fontSize: 32,
    maxWidth: usableWidth,
  });
  if (nameGraphic) {
    zpl += `^FO${PAD.left},${row2Y}${nameGraphic.command}^FS`;
  } else {
    zpl += `^FO${PAD.left},${row2Y}^A0N,36,36^FD${sanitizeText(displayName, 24)}^FS`;
  }

  zpl += `^PQ1^XZ`;
  return zpl;
}

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
    const epc = generatePlainEPC(itemNumber, i, quantity, 96);

    const zpl = await buildThaiRFIDLabel({
      itemNumber,
      displayName,
      displayName2,
      sequenceNumber: i,
      totalQuantity: quantity,
      epcData: epc,
      labelSize,
    });

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
