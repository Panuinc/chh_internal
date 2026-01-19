import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { textToGraphic } from "@/lib/chainWay/zpl";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COMPANY_INFO = {
  name: "บริษัท ชื้ออะฮวด อุตสาหกรรม จำกัด",
  address: "9/1 หมู่ 2 ถนนบางเลน-ลาดหลุมแก้ว",
  district: "ต.ขุนศรี อ.ไทรน้อย จ.นนทบุรี 11150",
  phone: "02-921-9979",
};

const DPM = 11.8;

function mm(value) {
  return Math.round(value * DPM);
}

const MARGIN = mm(2);

const LABEL = {
  WIDTH: mm(100),
  HEIGHT: mm(150),
  PRINT_WIDTH: mm(100) - MARGIN * 2,
  PRINT_HEIGHT: mm(150) - MARGIN * 2,
};

const Y = {
  HEADER_TOP: MARGIN,
  HEADER_BOTTOM: MARGIN + mm(20),

  RECIPIENT_TOP: MARGIN + mm(21),
  RECIPIENT_BOTTOM: MARGIN + mm(41),

  TABLE_HEADER_TOP: MARGIN + mm(42),
  TABLE_HEADER_BOTTOM: MARGIN + mm(47),

  TABLE_BODY_TOP: MARGIN + mm(47),
  TABLE_BODY_BOTTOM: MARGIN + mm(122),

  FOOTER_TOP: MARGIN + mm(123),
  FOOTER_BOTTOM: MARGIN + mm(148),
};

const COL = {
  LABEL_START: mm(21),
  VALUE_START: mm(34),
};

function sanitize(text, maxLen = 100) {
  if (!text) return "";
  return String(text).replace(/[\^~]/g, "").substring(0, maxLen);
}

function splitText(text, maxCharsPerLine = 35) {
  if (!text || text.length <= maxCharsPerLine) {
    return [text || ""];
  }

  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  const result = [];
  for (const line of lines) {
    if (line.length <= maxCharsPerLine) {
      result.push(line);
    } else {
      for (let i = 0; i < line.length; i += maxCharsPerLine) {
        result.push(line.substring(i, i + maxCharsPerLine));
      }
    }
  }

  return result.slice(0, 3);
}

function getQRUrl(order) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://your-app.com";
  return `${base}/sales/salesOrderOnline/${order.id}`;
}

async function loadLogo(logoPath, maxW, maxH) {
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

    const hex = Array.from(bitmap, (b) =>
      b.toString(16).padStart(2, "0").toUpperCase(),
    ).join("");

    return {
      cmd: `^GFA,${totalBytes},${totalBytes},${bytesPerRow},${hex}`,
      w,
      h,
    };
  } catch (e) {
    console.error("[PackingSlip] Logo error:", e);
    return null;
  }
}

async function generateZPL(order, piece, totalPieces, logo) {
  const W = LABEL.WIDTH;
  const H = LABEL.HEIGHT;
  const items = (order.salesOrderLines || []).filter(
    (l) => l.lineType === "Item",
  );
  const qrUrl = getQRUrl(order);

  let zpl = "";

  zpl += `^XA^MMT^PW${W}^LL${H}^CI28`;

  zpl += `^FO${MARGIN},${MARGIN}^GB${LABEL.PRINT_WIDTH},${LABEL.PRINT_HEIGHT},3^FS`;

  const logoSize = mm(18);
  if (logo) {
    zpl += `^FO${MARGIN + mm(1)},${MARGIN + mm(1)}${logo.cmd}^FS`;
  } else {
    zpl += `^FO${MARGIN + mm(1)},${MARGIN + mm(1)}^GB${logoSize},${logoSize},2^FS`;
    const fallbackText = await textToGraphic("EVERGREEN", {
      fontSize: 32,
      maxWidth: logoSize,
    });
    if (fallbackText)
      zpl += `^FO${MARGIN + mm(2)},${MARGIN + mm(8)}${fallbackText.command}^FS`;
  }

  const labelX = MARGIN + COL.LABEL_START;
  const valueX = MARGIN + COL.VALUE_START;
  const rowSpacing = mm(5);

  const row1Y = MARGIN + mm(1);
  const senderLabel = await textToGraphic("ผู้ส่ง:", {
    fontSize: 32,
    maxWidth: mm(12),
  });
  if (senderLabel) zpl += `^FO${labelX},${row1Y}${senderLabel.command}^FS`;

  const companyName = await textToGraphic(COMPANY_INFO.name, {
    fontSize: 32,
    maxWidth: mm(50),
  });
  if (companyName) zpl += `^FO${valueX},${row1Y}${companyName.command}^FS`;

  const row2Y = row1Y + rowSpacing;
  const addrLabel = await textToGraphic("ที่อยู่:", {
    fontSize: 32,
    maxWidth: mm(12),
  });
  if (addrLabel) zpl += `^FO${labelX},${row2Y}${addrLabel.command}^FS`;

  const addr1 = await textToGraphic(COMPANY_INFO.address, {
    fontSize: 32,
    maxWidth: mm(50),
  });
  if (addr1) zpl += `^FO${valueX},${row2Y}${addr1.command}^FS`;

  const row3Y = row2Y + rowSpacing;
  const addr2 = await textToGraphic(COMPANY_INFO.district, {
    fontSize: 32,
    maxWidth: mm(50),
  });
  if (addr2) zpl += `^FO${valueX},${row3Y}${addr2.command}^FS`;

  const row4Y = row3Y + rowSpacing;
  const phoneLabel = await textToGraphic("โทร:", {
    fontSize: 32,
    maxWidth: mm(12),
  });
  if (phoneLabel) zpl += `^FO${labelX},${row4Y}${phoneLabel.command}^FS`;
  zpl += `^FO${valueX},${row4Y}^A0N,38,38^FD${COMPANY_INFO.phone}^FS`;

  zpl += `^FO${W - MARGIN - mm(15)},${MARGIN + mm(1)}^A0N,100,100^FD${piece}/${totalPieces}^FS`;

  zpl += `^FO${MARGIN},${Y.HEADER_BOTTOM}^GB${LABEL.PRINT_WIDTH},3,3^FS`;

  const recipientLabelX = MARGIN + mm(2);
  const recipientValueX = MARGIN + mm(14);
  const recipientRowSpacing = mm(5);

  const recRow1Y = Y.RECIPIENT_TOP + mm(1);
  const recipientLabel = await textToGraphic("ผู้รับ:", {
    fontSize: 38,
    maxWidth: mm(12),
  });
  if (recipientLabel)
    zpl += `^FO${recipientLabelX},${recRow1Y}${recipientLabel.command}^FS`;

  const recipientName = order.shipToName || order.customerName || "";
  const nameGraphic = await textToGraphic(recipientName, {
    fontSize: 42,
    maxWidth: mm(80),
  });
  if (nameGraphic)
    zpl += `^FO${recipientValueX},${recRow1Y}${nameGraphic.command}^FS`;

  const recRow2Y = recRow1Y + recipientRowSpacing;
  const recipientAddrLabel = await textToGraphic("ที่อยู่:", {
    fontSize: 32,
    maxWidth: mm(12),
  });
  if (recipientAddrLabel)
    zpl += `^FO${recipientLabelX},${recRow2Y}${recipientAddrLabel.command}^FS`;

  let addrY = recRow2Y;
  const shipAddr1 = order.shipToAddressLine1 || "";
  if (shipAddr1) {
    const a1 = await textToGraphic(shipAddr1, {
      fontSize: 30,
      maxWidth: mm(80),
    });
    if (a1) zpl += `^FO${recipientValueX},${addrY}${a1.command}^FS`;
    addrY += mm(4);
  }

  const shipAddr2 = order.shipToAddressLine2 || "";
  if (shipAddr2) {
    const a2 = await textToGraphic(shipAddr2, {
      fontSize: 30,
      maxWidth: mm(80),
    });
    if (a2) zpl += `^FO${recipientValueX},${addrY}${a2.command}^FS`;
    addrY += mm(4);
  }

  const cityZip =
    `${order.shipToCity || ""} ${order.shipToPostCode || ""}`.trim();
  if (cityZip) {
    const cz = await textToGraphic(cityZip, { fontSize: 30, maxWidth: mm(80) });
    if (cz) zpl += `^FO${recipientValueX},${addrY}${cz.command}^FS`;
  }

  const recPhoneY = Y.RECIPIENT_BOTTOM - mm(5);
  const recipientPhoneLabel = await textToGraphic("โทร:", {
    fontSize: 34,
    maxWidth: mm(10),
  });
  if (recipientPhoneLabel)
    zpl += `^FO${recipientLabelX},${recPhoneY}${recipientPhoneLabel.command}^FS`;
  zpl += `^FO${recipientValueX},${recPhoneY}^A0N,40,40^FD${sanitize(order.phoneNumber || "-", 20)}^FS`;

  zpl += `^FO${MARGIN},${Y.RECIPIENT_BOTTOM}^GB${LABEL.PRINT_WIDTH},3,3^FS`;

  const itemHeader = await textToGraphic("Item", {
    fontSize: 34,
    maxWidth: mm(12),
  });
  const descHeader = await textToGraphic("รายการสินค้า", {
    fontSize: 34,
    maxWidth: mm(50),
  });
  const qtyHeader = await textToGraphic("จำนวน", {
    fontSize: 34,
    maxWidth: mm(14),
  });

  if (itemHeader)
    zpl += `^FO${MARGIN + mm(2)},${Y.TABLE_HEADER_TOP + mm(1)}${itemHeader.command}^FS`;
  if (descHeader)
    zpl += `^FO${MARGIN + mm(14)},${Y.TABLE_HEADER_TOP + mm(1)}${descHeader.command}^FS`;
  if (qtyHeader)
    zpl += `^FO${W - MARGIN - mm(16)},${Y.TABLE_HEADER_TOP + mm(1)}${qtyHeader.command}^FS`;

  zpl += `^FO${MARGIN},${Y.TABLE_HEADER_BOTTOM}^GB${LABEL.PRINT_WIDTH},2,2^FS`;

  const lineHeight = mm(4.5);
  const rowPadding = mm(1);

  let rowY = Y.TABLE_BODY_TOP + mm(1);
  let itemIndex = 0;

  while (itemIndex < items.length && rowY < Y.TABLE_BODY_BOTTOM - mm(8)) {
    const line = items[itemIndex];
    const itemNum = itemIndex + 1;
    const qty = line.quantity || 0;

    const descLines = splitText(sanitize(line.description, 100), 40);
    const rowHeight = descLines.length * lineHeight + rowPadding;

    if (rowY + rowHeight > Y.TABLE_BODY_BOTTOM - mm(5)) {
      break;
    }

    zpl += `^FO${MARGIN + mm(4)},${rowY}^A0N,32,32^FD${itemNum}^FS`;

    let descY = rowY;
    for (const descLine of descLines) {
      const descG = await textToGraphic(descLine, {
        fontSize: 30,
        maxWidth: mm(65),
      });
      if (descG) zpl += `^FO${MARGIN + mm(14)},${descY}${descG.command}^FS`;
      descY += lineHeight;
    }

    const qtyY = rowY + ((descLines.length - 1) * lineHeight) / 2;
    zpl += `^FO${W - MARGIN - mm(10)},${qtyY}^A0N,32,32^FD${qty}^FS`;

    const lineY = rowY + rowHeight;
    zpl += `^FO${MARGIN + mm(1)},${lineY}^GB${LABEL.PRINT_WIDTH - mm(2)},1,1^FS`;

    rowY = lineY + mm(1);
    itemIndex++;
  }

  if (itemIndex < items.length) {
    const remaining = items.length - itemIndex;
    const moreText = `... และอีก ${remaining} รายการ`;
    const moreG = await textToGraphic(moreText, {
      fontSize: 28,
      maxWidth: mm(50),
    });
    if (moreG) zpl += `^FO${MARGIN + mm(14)},${rowY}${moreG.command}^FS`;
  }

  zpl += `^FO${MARGIN},${Y.FOOTER_TOP}^GB${LABEL.PRINT_WIDTH},3,3^FS`;

  const note1 = await textToGraphic(
    "! กรุณาถ่ายวิดีโอขณะแกะพัสดุ เพื่อใช้เป็นหลัก",
    { fontSize: 32, maxWidth: mm(72) },
  );
  const note2 = await textToGraphic(
    "  ฐานการเคลมสินค้า ไม่มีหลักฐานงดเคลมทุกกรณี",
    { fontSize: 32, maxWidth: mm(72) },
  );

  if (note1)
    zpl += `^FO${MARGIN + mm(2)},${Y.FOOTER_TOP + mm(4)}${note1.command}^FS`;
  if (note2)
    zpl += `^FO${MARGIN + mm(2)},${Y.FOOTER_TOP + mm(11)}${note2.command}^FS`;

  const qrMag = 4;
  const qrX = W - MARGIN - mm(20);
  const qrY2 = Y.FOOTER_TOP + mm(3);
  zpl += `^FO${qrX},${qrY2}^BQN,2,${qrMag}^FDQA,${qrUrl}^FS`;

  zpl += `^PQ1^XZ`;

  return zpl;
}

export async function POST(request) {
  try {
    const { order, totalPieces } = await request.json();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order is required" },
        { status: 400 },
      );
    }

    const logoSize = mm(18);
    const logo = await loadLogo("logo/logo-09.png", logoSize, logoSize);

    const labels = [];
    for (let i = 1; i <= totalPieces; i++) {
      const zpl = await generateZPL(order, i, totalPieces, logo);
      labels.push(zpl);
    }

    return NextResponse.json({
      success: true,
      labels,
      count: labels.length,
    });
  } catch (error) {
    console.error("[PackingSlip API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate labels" },
      { status: 500 },
    );
  }
}
