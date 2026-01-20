import fs from "fs";
import path from "path";
import {
  COMPANY_INFO,
  PACKING_SLIP_LABEL,
  PACKING_SLIP_SECTIONS,
} from "./config.js";
import {
  mmToDots,
  sanitizeText,
  splitText,
  generateOrderQRUrl,
  calculateTotalPieces,
  getItemLines,
  delay,
} from "./utils.js";
import { textToGraphic } from "./zpl.js";

export async function loadLogo(logoPath, maxW, maxH) {
  try {
    const { createCanvas, loadImage } = await import("canvas");

    const fullPath = path.join(process.cwd(), "public", logoPath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`[PackingSlip] Logo not found: ${fullPath}`);
      return null;
    }

    const img = await loadImage(fullPath);

    const scale = Math.min(maxW / img.width, maxH / img.height);
    const w = Math.floor(img.width * scale);
    const h = Math.floor(img.height * scale);

    const canvas = createCanvas(w, h);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const { data } = ctx.getImageData(0, 0, w, h);
    const bytesPerRow = Math.ceil(w / 8);
    const totalBytes = bytesPerRow * h;
    const bitmap = new Uint8Array(totalBytes);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (gray < 128) {
          bitmap[y * bytesPerRow + Math.floor(x / 8)] |= 1 << (7 - (x % 8));
        }
      }
    }

    const hex = Array.from(bitmap, (b) => b.toString(16).padStart(2, "0").toUpperCase()).join("");

    return { cmd: `^GFA,${totalBytes},${totalBytes},${bytesPerRow},${hex}`, w, h };
  } catch (e) {
    console.error("[PackingSlip] Logo error:", e);
    return null;
  }
}

export async function generatePackingSlipZPL(order, piece, totalPieces, logo) {
  const W = PACKING_SLIP_LABEL.WIDTH_DOTS;
  const H = PACKING_SLIP_LABEL.HEIGHT_DOTS;
  const MARGIN = PACKING_SLIP_LABEL.MARGIN;
  const Y = PACKING_SLIP_SECTIONS;
  const PRINT_WIDTH = W - MARGIN * 2;
  const PRINT_HEIGHT = H - MARGIN * 2;

  const items = getItemLines(order);
  const qrUrl = generateOrderQRUrl(order);

  let zpl = `^XA^MMT^PW${W}^LL${H}^CI28`;
  zpl += `^FO${MARGIN},${MARGIN}^GB${PRINT_WIDTH},${PRINT_HEIGHT},3^FS`;

  const logoSize = mmToDots(18);
  if (logo) {
    zpl += `^FO${MARGIN + mmToDots(1)},${MARGIN + mmToDots(1)}${logo.cmd}^FS`;
  } else {
    zpl += `^FO${MARGIN + mmToDots(1)},${MARGIN + mmToDots(1)}^GB${logoSize},${logoSize},2^FS`;
    const fallbackText = await textToGraphic("EVERGREEN", { fontSize: 32, maxWidth: logoSize });
    if (fallbackText) zpl += `^FO${MARGIN + mmToDots(2)},${MARGIN + mmToDots(8)}${fallbackText.command}^FS`;
  }

  const labelX = MARGIN + mmToDots(21);
  const valueX = MARGIN + mmToDots(34);
  const rowSpacing = mmToDots(5);

  const row1Y = MARGIN + mmToDots(1);
  const senderLabel = await textToGraphic("ผู้ส่ง:", { fontSize: 32, maxWidth: mmToDots(12) });
  if (senderLabel) zpl += `^FO${labelX},${row1Y}${senderLabel.command}^FS`;

  const companyName = await textToGraphic(COMPANY_INFO.name, { fontSize: 32, maxWidth: mmToDots(50) });
  if (companyName) zpl += `^FO${valueX},${row1Y}${companyName.command}^FS`;

  const row2Y = row1Y + rowSpacing;
  const addrLabel = await textToGraphic("ที่อยู่:", { fontSize: 32, maxWidth: mmToDots(12) });
  if (addrLabel) zpl += `^FO${labelX},${row2Y}${addrLabel.command}^FS`;

  const addr1 = await textToGraphic(COMPANY_INFO.address, { fontSize: 32, maxWidth: mmToDots(50) });
  if (addr1) zpl += `^FO${valueX},${row2Y}${addr1.command}^FS`;

  const row3Y = row2Y + rowSpacing;
  const addr2 = await textToGraphic(COMPANY_INFO.district, { fontSize: 32, maxWidth: mmToDots(50) });
  if (addr2) zpl += `^FO${valueX},${row3Y}${addr2.command}^FS`;

  const row4Y = row3Y + rowSpacing;
  const phoneLabel = await textToGraphic("โทร:", { fontSize: 32, maxWidth: mmToDots(12) });
  if (phoneLabel) zpl += `^FO${labelX},${row4Y}${phoneLabel.command}^FS`;
  zpl += `^FO${valueX},${row4Y}^A0N,38,38^FD${COMPANY_INFO.phone}^FS`;

  zpl += `^FO${W - MARGIN - mmToDots(15)},${MARGIN + mmToDots(1)}^A0N,100,100^FD${piece}/${totalPieces}^FS`;
  zpl += `^FO${MARGIN},${Y.HEADER_BOTTOM}^GB${PRINT_WIDTH},3,3^FS`;

  const recipientLabelX = MARGIN + mmToDots(2);
  const recipientValueX = MARGIN + mmToDots(14);
  const recipientRowSpacing = mmToDots(5);

  const recRow1Y = Y.RECIPIENT_TOP + mmToDots(1);
  const recipientLabel = await textToGraphic("ผู้รับ:", { fontSize: 38, maxWidth: mmToDots(12) });
  if (recipientLabel) zpl += `^FO${recipientLabelX},${recRow1Y}${recipientLabel.command}^FS`;

  const recipientName = order.shipToName || order.customerName || "";
  const nameGraphic = await textToGraphic(recipientName, { fontSize: 42, maxWidth: mmToDots(80) });
  if (nameGraphic) zpl += `^FO${recipientValueX},${recRow1Y}${nameGraphic.command}^FS`;

  const recRow2Y = recRow1Y + recipientRowSpacing;
  const recipientAddrLabel = await textToGraphic("ที่อยู่:", { fontSize: 32, maxWidth: mmToDots(12) });
  if (recipientAddrLabel) zpl += `^FO${recipientLabelX},${recRow2Y}${recipientAddrLabel.command}^FS`;

  let addrY = recRow2Y;
  const shipAddr1 = order.shipToAddressLine1 || "";
  if (shipAddr1) {
    const a1 = await textToGraphic(shipAddr1, { fontSize: 30, maxWidth: mmToDots(80) });
    if (a1) zpl += `^FO${recipientValueX},${addrY}${a1.command}^FS`;
    addrY += mmToDots(4);
  }

  const shipAddr2 = order.shipToAddressLine2 || "";
  if (shipAddr2) {
    const a2 = await textToGraphic(shipAddr2, { fontSize: 30, maxWidth: mmToDots(80) });
    if (a2) zpl += `^FO${recipientValueX},${addrY}${a2.command}^FS`;
    addrY += mmToDots(4);
  }

  const cityZip = `${order.shipToCity || ""} ${order.shipToPostCode || ""}`.trim();
  if (cityZip) {
    const cz = await textToGraphic(cityZip, { fontSize: 30, maxWidth: mmToDots(80) });
    if (cz) zpl += `^FO${recipientValueX},${addrY}${cz.command}^FS`;
  }

  const recPhoneY = Y.RECIPIENT_BOTTOM - mmToDots(5);
  const recipientPhoneLabel = await textToGraphic("โทร:", { fontSize: 34, maxWidth: mmToDots(10) });
  if (recipientPhoneLabel) zpl += `^FO${recipientLabelX},${recPhoneY}${recipientPhoneLabel.command}^FS`;
  zpl += `^FO${recipientValueX},${recPhoneY}^A0N,40,40^FD${sanitizeText(order.phoneNumber || "-", 20)}^FS`;

  zpl += `^FO${MARGIN},${Y.RECIPIENT_BOTTOM}^GB${PRINT_WIDTH},3,3^FS`;

  const itemHeader = await textToGraphic("Item", { fontSize: 34, maxWidth: mmToDots(12) });
  const descHeader = await textToGraphic("รายการสินค้า", { fontSize: 34, maxWidth: mmToDots(50) });
  const qtyHeader = await textToGraphic("จำนวน", { fontSize: 34, maxWidth: mmToDots(14) });

  if (itemHeader) zpl += `^FO${MARGIN + mmToDots(2)},${Y.TABLE_HEADER_TOP + mmToDots(1)}${itemHeader.command}^FS`;
  if (descHeader) zpl += `^FO${MARGIN + mmToDots(14)},${Y.TABLE_HEADER_TOP + mmToDots(1)}${descHeader.command}^FS`;
  if (qtyHeader) zpl += `^FO${W - MARGIN - mmToDots(16)},${Y.TABLE_HEADER_TOP + mmToDots(1)}${qtyHeader.command}^FS`;

  zpl += `^FO${MARGIN},${Y.TABLE_HEADER_BOTTOM}^GB${PRINT_WIDTH},2,2^FS`;

  const lineHeight = mmToDots(4.5);
  const rowPadding = mmToDots(1);

  let rowY = Y.TABLE_BODY_TOP + mmToDots(1);
  let itemIndex = 0;

  while (itemIndex < items.length && rowY < Y.TABLE_BODY_BOTTOM - mmToDots(8)) {
    const line = items[itemIndex];
    const itemNum = itemIndex + 1;
    const qty = line.quantity || 0;

    const descLines = splitText(sanitizeText(line.description, 100), 40);
    const rowHeight = descLines.length * lineHeight + rowPadding;

    if (rowY + rowHeight > Y.TABLE_BODY_BOTTOM - mmToDots(5)) break;

    zpl += `^FO${MARGIN + mmToDots(4)},${rowY}^A0N,32,32^FD${itemNum}^FS`;

    let descY = rowY;
    for (const descLine of descLines) {
      const descG = await textToGraphic(descLine, { fontSize: 30, maxWidth: mmToDots(65) });
      if (descG) zpl += `^FO${MARGIN + mmToDots(14)},${descY}${descG.command}^FS`;
      descY += lineHeight;
    }

    const qtyY = rowY + ((descLines.length - 1) * lineHeight) / 2;
    zpl += `^FO${W - MARGIN - mmToDots(10)},${qtyY}^A0N,32,32^FD${qty}^FS`;

    const lineY = rowY + rowHeight;
    zpl += `^FO${MARGIN + mmToDots(1)},${lineY}^GB${PRINT_WIDTH - mmToDots(2)},1,1^FS`;

    rowY = lineY + mmToDots(1);
    itemIndex++;
  }

  if (itemIndex < items.length) {
    const remaining = items.length - itemIndex;
    const moreText = `... และอีก ${remaining} รายการ`;
    const moreG = await textToGraphic(moreText, { fontSize: 28, maxWidth: mmToDots(50) });
    if (moreG) zpl += `^FO${MARGIN + mmToDots(14)},${rowY}${moreG.command}^FS`;
  }

  zpl += `^FO${MARGIN},${Y.FOOTER_TOP}^GB${PRINT_WIDTH},3,3^FS`;

  const note1 = await textToGraphic("! กรุณาถ่ายวิดีโอขณะแกะพัสดุ เพื่อใช้เป็นหลัก", { fontSize: 32, maxWidth: mmToDots(72) });
  const note2 = await textToGraphic("  ฐานการเคลมสินค้า ไม่มีหลักฐานงดเคลมทุกกรณี", { fontSize: 32, maxWidth: mmToDots(72) });

  if (note1) zpl += `^FO${MARGIN + mmToDots(2)},${Y.FOOTER_TOP + mmToDots(4)}${note1.command}^FS`;
  if (note2) zpl += `^FO${MARGIN + mmToDots(2)},${Y.FOOTER_TOP + mmToDots(11)}${note2.command}^FS`;

  const qrMag = 4;
  const qrX = W - MARGIN - mmToDots(20);
  const qrY = Y.FOOTER_TOP + mmToDots(3);
  zpl += `^FO${qrX},${qrY}^BQN,2,${qrMag}^FDQA,${qrUrl}^FS`;

  zpl += `^PQ1^XZ`;

  return zpl;
}

export async function generateAllPackingSlips(order) {
  const totalPieces = calculateTotalPieces(order);

  if (totalPieces === 0) return [];

  const logoSize = mmToDots(18);
  const logo = await loadLogo("logo/logo-09.png", logoSize, logoSize);

  const labels = [];
  for (let i = 1; i <= totalPieces; i++) {
    const zpl = await generatePackingSlipZPL(order, i, totalPieces, logo);
    labels.push(zpl);
  }

  return labels;
}

export function previewPackingSlip(order) {
  const itemLines = getItemLines(order);
  const totalPieces = itemLines.reduce((sum, line) => sum + (line.quantity || 0), 0);

  return {
    orderNumber: order.number,
    customerName: order.customerName,
    shipToName: order.shipToName,
    shipToAddress: [
      order.shipToAddressLine1,
      order.shipToAddressLine2,
      `${order.shipToCity || ""} ${order.shipToPostCode || ""}`.trim(),
    ].filter(Boolean).join(", "),
    phoneNumber: order.phoneNumber,
    itemCount: itemLines.length,
    totalPieces,
    items: itemLines.map((line, index) => ({
      index: index + 1,
      itemNumber: line.itemNumber,
      description: line.description,
      description2: line.description2,
      quantity: line.quantity,
      unit: line.unitOfMeasureCode,
    })),
  };
}

export { calculateTotalPieces };