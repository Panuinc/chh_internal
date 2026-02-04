import fs from "fs";
import path from "path";
import { COMPANY_INFO } from "./config.js";
import { mmToDots, sanitizeText, getItemLines, splitText } from "./utils.js";
import { textToGraphic } from "./zpl.js";
import { createLogger } from "@/lib/shared/logger";

const logger = createLogger("packing-slip");

const LABEL = {
  WIDTH: 100,
  HEIGHT: 150,
  MARGIN: 5,
};

const mm = (v) => mmToDots(v);

const DOTS = {
  W: mm(LABEL.WIDTH),
  H: mm(LABEL.HEIGHT),
  M: mm(LABEL.MARGIN),
  PW: mm(LABEL.WIDTH - LABEL.MARGIN * 2),
  PH: mm(LABEL.HEIGHT - LABEL.MARGIN * 2),
};

const SECTION = {
  HEADER: 20,
  BARCODE: 20,
  RECIPIENT: 20,
  TABLE_HEADER: 5,
  FOOTER: 25,
};

export async function loadImage(imagePath, maxW, maxH) {
  try {
    const { createCanvas, loadImage: loadImg } = await import("canvas");
    const fullPath = path.join(process.cwd(), "public", imagePath);

    if (!fs.existsSync(fullPath)) {
      logger.warn("Image not found", { path: fullPath });
      return null;
    }

    const img = await loadImg(fullPath);
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

    const hex = Array.from(bitmap, (b) =>
      b.toString(16).padStart(2, "0").toUpperCase(),
    ).join("");
    return {
      cmd: `^GFA,${totalBytes},${totalBytes},${bytesPerRow},${hex}`,
      w,
      h,
    };
  } catch (e) {
    logger.error({ message: "Image error", error: e.message });
    return null;
  }
}

function generateBarcodeValue(itemNumber, pieceNumber, totalPieces) {
  return `${itemNumber}-${pieceNumber}/${totalPieces}`;
}

function expandItemsByQuantity(items) {
  const expanded = [];
  for (const item of items) {
    const qty = item.quantity || 1;
    for (let i = 1; i <= qty; i++) {
      expanded.push({
        item,
        pieceIndexOfItem: i,
        totalPiecesOfItem: qty,
      });
    }
  }
  return expanded;
}

export async function generatePackingSlipZPL(
  order,
  piece,
  totalPieces,
  currentItem,
  logo,
  qrCode,
) {
  const M = DOTS.M;
  const W = DOTS.W;
  const PW = DOTS.PW;
  const PH = DOTS.PH;

  const barcodeValue = currentItem
    ? generateBarcodeValue(currentItem.itemNumber || "ITEM", piece, totalPieces)
    : `NO-ITEM-${piece}/${totalPieces}`;

  let zpl = `^XA^MMT^PW${W}^LL${DOTS.H}^CI28`;

  zpl += `^FO${M},${M}^GB${PW},${PH},3^FS`;

  const headerH = mm(SECTION.HEADER);
  const logoW = mm(18);
  const pieceW = mm(12);

  zpl += `^FO${M + logoW},${M}^GB0,${headerH},2^FS`;
  zpl += `^FO${M + PW - pieceW},${M}^GB0,${headerH},2^FS`;

  if (logo) {
    const logoX = M + (logoW - logo.w) / 2;
    const logoY = M + (headerH - logo.h) / 2;
    zpl += `^FO${logoX},${logoY}${logo.cmd}^FS`;
  }

  const companyX = M + logoW + mm(2);
  const labelW = mm(10);
  const valueX = companyX + labelW;
  const lineH = mm(5);

  let y = M + mm(2);

  const fromLabel = await textToGraphic("ผู้ส่ง:", {
    fontSize: 28,
    maxWidth: labelW,
  });
  if (fromLabel) zpl += `^FO${companyX},${y}${fromLabel.command}^FS`;

  const compName = await textToGraphic(COMPANY_INFO.name, {
    fontSize: 32,
    maxWidth: mm(48),
  });
  if (compName) zpl += `^FO${valueX},${y}${compName.command}^FS`;

  y += lineH;
  const addrLabel = await textToGraphic("ที่อยู่:", {
    fontSize: 28,
    maxWidth: labelW,
  });
  if (addrLabel) zpl += `^FO${companyX},${y}${addrLabel.command}^FS`;
  const addr1 = await textToGraphic(COMPANY_INFO.address1, {
    fontSize: 28,
    maxWidth: mm(48),
  });
  if (addr1) zpl += `^FO${valueX},${y}${addr1.command}^FS`;

  y += lineH - mm(1);
  const addr2 = await textToGraphic(COMPANY_INFO.address2, {
    fontSize: 28,
    maxWidth: mm(48),
  });
  if (addr2) zpl += `^FO${valueX},${y}${addr2.command}^FS`;

  y += lineH - mm(1);
  const phoneLabel = await textToGraphic("โทร:", {
    fontSize: 28,
    maxWidth: labelW,
  });
  if (phoneLabel) zpl += `^FO${companyX},${y}${phoneLabel.command}^FS`;
  zpl += `^FO${valueX},${y}^A0N,32,32^FD${COMPANY_INFO.phone}^FS`;

  const pieceX = M + PW - pieceW;
  const pieceTextX = pieceX + mm(1);
  const pieceTextY = M + mm(5);
  zpl += `^FO${pieceTextX},${pieceTextY}^A0N,90,90^FD${piece}/${totalPieces}^FS`;

  const headerBottom = M + headerH;
  zpl += `^FO${M},${headerBottom}^GB${PW},3,3^FS`;

  const barcodeTop = headerBottom;
  const barcodeH = mm(SECTION.BARCODE);
  const barcodeBoxW = PW;

  const barcodeHeight = mm(12);
  const textHeight = mm(4);
  const totalContentH = barcodeHeight + textHeight;

  const barcodeY = barcodeTop + (barcodeH - totalContentH) / 2;

  const charCount = barcodeValue.length;
  const estimatedBarcodeWidth = (charCount * 11 + 35) * 2;
  const barcodeX = M + (barcodeBoxW - estimatedBarcodeWidth) / 2;

  zpl += `^BY2,3,${barcodeHeight}`;
  zpl += `^FO${barcodeX},${barcodeY}^BCN,${barcodeHeight},Y,N,N^FD${barcodeValue}^FS`;

  const barcodeBottom = barcodeTop + barcodeH;
  zpl += `^FO${M},${barcodeBottom}^GB${PW},3,3^FS`;

  const recTop = barcodeBottom;
  const recH = mm(SECTION.RECIPIENT);
  const recLabelX = M + mm(2);
  const recValueX = M + mm(12);
  const recLineH = mm(5);

  let recY = recTop + mm(2);

  const recLabel = await textToGraphic("ผู้รับ:", {
    fontSize: 32,
    maxWidth: mm(10),
  });
  if (recLabel) zpl += `^FO${recLabelX},${recY}${recLabel.command}^FS`;
  const recName = order.shipToName || order.customerName || "";
  const recNameG = await textToGraphic(recName, {
    fontSize: 36,
    maxWidth: mm(75),
  });
  if (recNameG) zpl += `^FO${recValueX},${recY}${recNameG.command}^FS`;

  recY += recLineH;

  const recAddrLabel = await textToGraphic("ที่อยู่:", {
    fontSize: 28,
    maxWidth: mm(10),
  });
  if (recAddrLabel) zpl += `^FO${recLabelX},${recY}${recAddrLabel.command}^FS`;

  const fullAddr = [
    order.shipToAddressLine1,
    order.shipToAddressLine2,
    `${order.shipToCity || ""} ${order.shipToPostCode || ""}`.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  const addrG = await textToGraphic(fullAddr, {
    fontSize: 28,
    maxWidth: mm(75),
  });
  if (addrG) zpl += `^FO${recValueX},${recY}${addrG.command}^FS`;

  recY += recLineH;

  const recPhoneLabel = await textToGraphic("โทร:", {
    fontSize: 28,
    maxWidth: mm(10),
  });
  if (recPhoneLabel)
    zpl += `^FO${recLabelX},${recY}${recPhoneLabel.command}^FS`;
  zpl += `^FO${recValueX},${recY}^A0N,32,32^FD${order.phoneNumber || "-"}^FS`;

  const recBottom = recTop + recH;
  zpl += `^FO${M},${recBottom}^GB${PW},3,3^FS`;

  const tableHeaderTop = recBottom;
  const tableHeaderH = mm(SECTION.TABLE_HEADER);

  const colItemX = M + mm(2);
  const colDescX = M + mm(12);
  const colQtyX = M + PW - mm(14);

  const thItem = await textToGraphic("Item", {
    fontSize: 28,
    maxWidth: mm(10),
  });
  if (thItem)
    zpl += `^FO${colItemX},${tableHeaderTop + mm(1)}${thItem.command}^FS`;
  const thDesc = await textToGraphic("รายการสินค้า", {
    fontSize: 28,
    maxWidth: mm(50),
  });
  if (thDesc)
    zpl += `^FO${colDescX},${tableHeaderTop + mm(1)}${thDesc.command}^FS`;
  const thQty = await textToGraphic("จำนวน", {
    fontSize: 28,
    maxWidth: mm(14),
  });
  if (thQty)
    zpl += `^FO${colQtyX},${tableHeaderTop + mm(1)}${thQty.command}^FS`;

  const tableHeaderBottom = tableHeaderTop + tableHeaderH;
  zpl += `^FO${M},${tableHeaderBottom}^GB${PW},2,2^FS`;

  const footerH = mm(SECTION.FOOTER);
  const footerTop = M + PH - footerH;
  zpl += `^FO${M},${footerTop}^GB${PW},3,3^FS`;

  const noteX = M + mm(2);
  const note1 = await textToGraphic("❗ กรุณาถ่ายวิดีโอขณะแกะพัสดุ", {
    fontSize: 34,
    maxWidth: mm(62),
  });
  const note2 = await textToGraphic("เพื่อใช้เป็นหลักฐานการเคลมสินค้า", {
    fontSize: 30,
    maxWidth: mm(62),
  });
  const note3 = await textToGraphic("ไม่มีหลักฐานงดเคลมทุกกรณี", {
    fontSize: 30,
    maxWidth: mm(62),
  });

  if (note1) zpl += `^FO${noteX},${footerTop + mm(2)}${note1.command}^FS`;
  if (note2) zpl += `^FO${noteX},${footerTop + mm(9)}${note2.command}^FS`;
  if (note3) zpl += `^FO${noteX},${footerTop + mm(16)}${note3.command}^FS`;

  const qrSize = mm(22);
  const qrX = M + PW - qrSize - mm(1);
  const qrY = footerTop + mm(1);

  if (qrCode) {
    const qrImgX = qrX + (qrSize - qrCode.w) / 2;
    const qrImgY = qrY + (qrSize - qrCode.h) / 2;
    zpl += `^FO${qrImgX},${qrImgY}${qrCode.cmd}^FS`;
  }

  const itemStartY = tableHeaderBottom + mm(1);
  const singleLineH = mm(4);
  const maxCharsPerLine = 35;

  if (currentItem) {
    const desc = sanitizeText(currentItem.description || "", 100);
    const descLines = splitText(desc, maxCharsPerLine);

    zpl += `^FO${colItemX + mm(2)},${itemStartY}^A0N,28,28^FD1^FS`;

    let descY = itemStartY;
    for (const descLine of descLines) {
      const descG = await textToGraphic(descLine, {
        fontSize: 26,
        maxWidth: mm(55),
      });
      if (descG) zpl += `^FO${colDescX},${descY}${descG.command}^FS`;
      descY += singleLineH;
    }

    zpl += `^FO${colQtyX + mm(4)},${itemStartY}^A0N,28,28^FD1^FS`;
  }

  zpl += `^PQ1^XZ`;
  return zpl;
}

export async function generateAllPackingSlips(order) {
  const items = getItemLines(order);
  const totalPieces = items.reduce((sum, l) => sum + (l.quantity || 0), 0);

  if (totalPieces === 0) return [];

  const expandedItems = expandItemsByQuantity(items);

  const logoSize = mm(16);
  const logo = await loadImage("logo/logo-09.png", logoSize, logoSize);

  const qrSize = mm(22);
  const qrCode = await loadImage("qrcode/lineEvergreen.png", qrSize, qrSize);

  const labels = [];
  for (let i = 0; i < expandedItems.length; i++) {
    const pieceNumber = i + 1;
    const { item } = expandedItems[i];

    const zpl = await generatePackingSlipZPL(
      order,
      pieceNumber,
      totalPieces,
      item,
      logo,
      qrCode,
    );
    labels.push(zpl);
  }

  return labels;
}

export { expandItemsByQuantity };
