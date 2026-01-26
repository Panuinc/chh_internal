"use client";

import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toPng } from "html-to-image";

import { COMPANY_INFO } from "@/lib/chainWay/config";
import { getItemLines } from "@/lib/chainWay/utils";

const LABEL = {
  WIDTH_MM: 100,
  HEIGHT_MM: 150,
  MARGIN_MM: 1,
  DPI: 96,
  PIXEL_RATIO: 2,
};

const mmToPx = (mm) => Math.round(mm * (LABEL.DPI / 25.4));

const DIMENSIONS = {
  WIDTH_PX: mmToPx(LABEL.WIDTH_MM),
  HEIGHT_PX: mmToPx(LABEL.HEIGHT_MM),
  MARGIN_PX: mmToPx(LABEL.MARGIN_MM),
};

function generateBarcodeValue(itemNumber, pieceNumber, total) {
  return `${itemNumber}-${pieceNumber}/${total}`;
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

function createRenderContainer() {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  document.body.appendChild(container);
  return container;
}

function generateSlipHTML(order, pieceNumber, totalPieces, currentItem) {
  const barcodeValue = currentItem
    ? generateBarcodeValue(
        currentItem.itemNumber || "ITEM",
        pieceNumber,
        totalPieces,
      )
    : `NO-ITEM-${pieceNumber}/${totalPieces}`;

  const fullAddress = [
    order.shipToAddressLine1,
    order.shipToAddressLine2,
    `${order.shipToCity || ""} ${order.shipToPostCode || ""}`.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  const contentWidth = DIMENSIONS.WIDTH_PX - DIMENSIONS.MARGIN_PX * 2;
  const contentHeight = DIMENSIONS.HEIGHT_PX - DIMENSIONS.MARGIN_PX * 2;

  return `
    <div style="
      width: ${DIMENSIONS.WIDTH_PX}px;
      height: ${DIMENSIONS.HEIGHT_PX}px;
      background: white;
      font-family: 'Sarabun', 'Noto Sans Thai', Arial, sans-serif;
      font-size: 12px;
      box-sizing: border-box;
      padding: ${DIMENSIONS.MARGIN_PX}px;
    ">
      <div style="
        width: ${contentWidth}px;
        height: ${contentHeight}px;
        border: 2px solid #000;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
      ">
        <div style="display: flex; border-bottom: 2px solid #000; height: 75px; flex-shrink: 0;">
          <div style="width: 60px; display: flex; align-items: center; justify-content: center; border-right: 2px solid #000; padding: 4px;">
            <img src="/logo/logo-09.png" style="width: 50px; height: 50px; object-fit: contain;" />
          </div>
          
          <div style="flex: 1; padding: 4px 8px; font-size: 10px;">
            <div style="display: flex; gap: 4px;">
              <span style="font-weight: bold; width: 35px;">ผู้ส่ง:</span>
              <span>${COMPANY_INFO.name}</span>
            </div>
            <div style="display: flex; gap: 4px;">
              <span style="font-weight: bold; width: 35px;">ที่อยู่:</span>
              <span>${COMPANY_INFO.address1}</span>
            </div>
            <div style="display: flex; gap: 4px;">
              <span style="font-weight: bold; width: 35px;"></span>
              <span>${COMPANY_INFO.address2}</span>
            </div>
            <div style="display: flex; gap: 4px;">
              <span style="font-weight: bold; width: 35px;">โทร:</span>
              <span>${COMPANY_INFO.phone}</span>
            </div>
          </div>
          
          <div style="width: 50px; display: flex; align-items: center; justify-content: center; border-left: 2px solid #000; font-size: 20px; font-weight: bold;">
            ${pieceNumber}/${totalPieces}
          </div>
        </div>
        
        <div style="display: flex; align-items: center; justify-content: center; border-bottom: 2px solid #000; padding: 4px; height: 55px; flex-shrink: 0;">
          <div style="text-align: center;">
            <svg id="barcode-${pieceNumber}"></svg>
            <div style="font-size: 10px; font-weight: bold; margin-top: 2px;">${barcodeValue}</div>
          </div>
        </div>
        
        <div style="border-bottom: 2px solid #000; padding: 8px; height: 80px; flex-shrink: 0;">
          <div style="display: flex; gap: 4px; margin-bottom: 4px;">
            <span style="font-weight: bold; width: 40px;">ผู้รับ:</span>
            <span style="font-weight: bold; font-size: 14px;">${order.shipToName || order.customerName || ""}</span>
          </div>
          <div style="display: flex; gap: 4px; font-size: 10px;">
            <span style="font-weight: bold; width: 40px;">ที่อยู่:</span>
            <span style="flex: 1;">${fullAddress}</span>
          </div>
          <div style="display: flex; gap: 4px; font-size: 10px; margin-top: 2px;">
            <span style="font-weight: bold; width: 40px;">โทร:</span>
            <span>${order.phoneNumber || "-"}</span>
          </div>
        </div>
        
        <div style="display: flex; background: #f0f0f0; border-bottom: 1px solid #000; padding: 4px 8px; font-weight: bold; font-size: 10px; flex-shrink: 0;">
          <span style="width: 30px; text-align: center;">#</span>
          <span style="flex: 1;">รายการสินค้า</span>
          <span style="width: 40px; text-align: right;">จำนวน</span>
        </div>
        
        <div style="flex: 1; overflow: hidden;">
          ${
            currentItem
              ? `
            <div style="display: flex; padding: 8px; border-bottom: 1px solid #ddd;">
              <span style="width: 30px; text-align: center; font-weight: bold;">1</span>
              <div style="flex: 1;">
                <div style="font-size: 11px;">${currentItem.description || ""}</div>
                ${currentItem.description2 ? `<div style="font-size: 9px; color: #666; margin-top: 2px;">${currentItem.description2}</div>` : ""}
                <div style="font-size: 9px; color: #888; margin-top: 2px;">Item: ${currentItem.itemNumber || ""}</div>
              </div>
              <span style="width: 40px; text-align: right; font-weight: bold; font-size: 16px;">1</span>
            </div>
          `
              : `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999;">
              ไม่มีสินค้า
            </div>
          `
          }
        </div>
        
        <div style="display: flex; border-top: 2px solid #000; height: 95px; flex-shrink: 0;">
          <div style="flex: 1; padding: 8px;">
            <p style="color: #dc2626; font-weight: bold; font-size: 11px; margin: 0;">
              ❗ กรุณาถ่ายวิดีโอขณะแกะพัสดุ
            </p>
            <p style="color: #dc2626; font-size: 10px; margin: 2px 0 0 0;">
              เพื่อใช้เป็นหลักฐานการเคลมสินค้า
            </p>
            <p style="color: #dc2626; font-size: 10px; margin: 2px 0 0 0;">
              ไม่มีหลักฐานงดเคลมทุกกรณี
            </p>
          </div>
          <div style="width: 80px; display: flex; align-items: center; justify-content: center; padding: 4px;">
            <img src="/qrcode/lineEvergreen.png" style="width: 70px; height: 70px; object-fit: contain;" />
          </div>
        </div>
      </div>
    </div>
  `;
}

async function generateBarcodeSVG(element, value) {
  const JsBarcode = (await import("jsbarcode")).default;
  const barcodeElement = element.querySelector(`svg[id^="barcode-"]`);
  if (barcodeElement) {
    JsBarcode(barcodeElement, value, {
      format: "CODE128",
      width: 1,
      height: 28,
      displayValue: false,
      margin: 0,
    });
  }
}

export async function exportPackingSlipsAsZip(order, onProgress, options = {}) {
  const items = getItemLines(order);
  const totalPieces = items.reduce((sum, l) => sum + (l.quantity || 0), 0);

  if (totalPieces === 0) {
    throw new Error("No items to export");
  }

  const orderWithAddress = options.customAddress
    ? { ...order, ...options.customAddress }
    : order;

  const expandedItems = expandItemsByQuantity(items);
  const zip = new JSZip();
  const folder = zip.folder(`packing-slips-${order.number}`);
  const container = createRenderContainer();

  try {
    for (let i = 0; i < expandedItems.length; i++) {
      const pieceNumber = i + 1;
      const { item } = expandedItems[i];

      const slipElement = document.createElement("div");
      slipElement.innerHTML = generateSlipHTML(
        orderWithAddress,
        pieceNumber,
        totalPieces,
        item,
      );
      container.appendChild(slipElement);

      const barcodeValue = item
        ? generateBarcodeValue(
            item.itemNumber || "ITEM",
            pieceNumber,
            totalPieces,
          )
        : `NO-ITEM-${pieceNumber}/${totalPieces}`;

      await generateBarcodeSVG(slipElement, barcodeValue);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await toPng(slipElement.firstElementChild, {
        quality: 1,
        pixelRatio: LABEL.PIXEL_RATIO,
        backgroundColor: "#ffffff",
      });

      const base64Data = dataUrl.split(",")[1];
      const fileName = `${order.number}_${String(pieceNumber).padStart(3, "0")}_of_${totalPieces}.png`;
      folder.file(fileName, base64Data, { base64: true });

      container.removeChild(slipElement);
      onProgress?.(pieceNumber, totalPieces);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `packing-slips-${order.number}.zip`);

    return {
      success: true,
      exported: totalPieces,
      total: totalPieces,
    };
  } catch (error) {
    console.error("Export error:", error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
}

export async function exportSingleSlipAsPng(order, pieceNumber, options = {}) {
  const items = getItemLines(order);
  const totalPieces = items.reduce((sum, l) => sum + (l.quantity || 0), 0);
  const expandedItems = expandItemsByQuantity(items);

  const { item } = expandedItems[pieceNumber - 1] || {};

  const orderWithAddress = options.customAddress
    ? { ...order, ...options.customAddress }
    : order;

  const container = createRenderContainer();

  try {
    const slipElement = document.createElement("div");
    slipElement.innerHTML = generateSlipHTML(
      orderWithAddress,
      pieceNumber,
      totalPieces,
      item,
    );
    container.appendChild(slipElement);

    const barcodeValue = item
      ? generateBarcodeValue(
          item.itemNumber || "ITEM",
          pieceNumber,
          totalPieces,
        )
      : `NO-ITEM-${pieceNumber}/${totalPieces}`;

    await generateBarcodeSVG(slipElement, barcodeValue);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const dataUrl = await toPng(slipElement.firstElementChild, {
      quality: 1,
      pixelRatio: LABEL.PIXEL_RATIO,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = `${order.number}_${String(pieceNumber).padStart(3, "0")}_of_${totalPieces}.png`;
    link.href = dataUrl;
    link.click();

    return { success: true };
  } finally {
    document.body.removeChild(container);
  }
}
