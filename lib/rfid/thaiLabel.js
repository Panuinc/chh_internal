/**
 * Thai Text to ZPL Image Converter
 * 
 * แปลงข้อความภาษาไทยเป็น ZPL Graphic command
 * 
 * File: lib/rfid/thaiLabel.js
 */

import { createCanvas } from 'canvas';

/**
 * แปลงข้อความเป็น ZPL Graphic Format (^GFA)
 * 
 * @param {string} text - ข้อความที่ต้องการพิมพ์
 * @param {Object} options - ตัวเลือก
 * @returns {string} - ZPL ^GFA command
 */
export function textToZPLGraphic(text, options = {}) {
    const {
        fontSize = 40,
        fontFamily = 'Arial, Tahoma, sans-serif',
        maxWidth = 1000,
    } = options;

    // สร้าง canvas เพื่อวัดขนาดข้อความ
    const measureCanvas = createCanvas(1, 1);
    const measureCtx = measureCanvas.getContext('2d');
    measureCtx.font = `${fontSize}px ${fontFamily}`;
    
    const metrics = measureCtx.measureText(text);
    const textWidth = Math.min(Math.ceil(metrics.width) + 10, maxWidth);
    const textHeight = fontSize + 10;

    // สร้าง canvas จริงสำหรับวาดข้อความ
    const canvas = createCanvas(textWidth, textHeight);
    const ctx = canvas.getContext('2d');

    // พื้นหลังสีขาว
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, textWidth, textHeight);

    // วาดข้อความสีดำ
    ctx.fillStyle = 'black';
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 5, textHeight / 2);

    // แปลงเป็น monochrome bitmap
    const imageData = ctx.getImageData(0, 0, textWidth, textHeight);
    const { data, width, height } = imageData;

    // แปลงเป็น 1-bit per pixel (monochrome)
    const bytesPerRow = Math.ceil(width / 8);
    const totalBytes = bytesPerRow * height;
    const bitmapData = new Uint8Array(totalBytes);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pixelIndex = (y * width + x) * 4;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];
            
            // ถ้า pixel มืด (< 128) ให้เป็น 1 (พิมพ์)
            const isBlack = (r + g + b) / 3 < 128;
            
            if (isBlack) {
                const byteIndex = y * bytesPerRow + Math.floor(x / 8);
                const bitIndex = 7 - (x % 8);
                bitmapData[byteIndex] |= (1 << bitIndex);
            }
        }
    }

    // แปลงเป็น hex string
    let hexData = '';
    for (let i = 0; i < bitmapData.length; i++) {
        hexData += bitmapData[i].toString(16).padStart(2, '0').toUpperCase();
    }

    // สร้าง ZPL command
    // ^GFA,<total bytes>,<total bytes>,<bytes per row>,<data>
    return {
        command: `^GFA,${totalBytes},${totalBytes},${bytesPerRow},${hexData}`,
        width: width,
        height: height,
    };
}

/**
 * สร้าง ZPL Label พร้อมข้อความภาษาไทย
 * 
 * @param {Object} options
 * @returns {string} - ZPL command
 */
export function buildThaiLabel(options) {
    const {
        itemNumber,
        displayName,
        displayName2 = '',
        barcodeData,
        quantity = 1,
        labelSize = { width: 100, height: 80 },
    } = options;

    // Convert mm to dots (300 DPI = 11.8 dots/mm)
    const dpmm = 11.8;
    const labelWidth = Math.round(labelSize.width * dpmm);
    const labelHeight = Math.round(labelSize.height * dpmm);
    const margin = 50;
    const barcodeHeight = 150;

    // แปลงข้อความภาษาไทยเป็น graphic
    const displayNameGraphic = textToZPLGraphic(displayName, { fontSize: 45 });
    const displayName2Graphic = displayName2 
        ? textToZPLGraphic(displayName2, { fontSize: 35 }) 
        : null;

    // สร้าง ZPL
    let zpl = `^XA^JUS^XZ^XA^MMT^PW${labelWidth}^LL${labelHeight}`;
    
    // Item Number (ใช้ font ปกติได้เพราะเป็นภาษาอังกฤษ)
    zpl += `^FO${margin},50^A0N,70,70^FD${itemNumber}^FS`;
    
    // Display Name (ภาษาไทย - ใช้ graphic)
    zpl += `^FO${margin},140${displayNameGraphic.command}^FS`;
    
    // Display Name 2 (ภาษาไทย - ใช้ graphic)
    if (displayName2Graphic) {
        zpl += `^FO${margin},220${displayName2Graphic.command}^FS`;
    }
    
    // Barcode
    zpl += `^FO${margin},400^BY3,3,${barcodeHeight}^BCN,,Y,N^FD${barcodeData || itemNumber}^FS`;
    
    zpl += `^PQ${quantity}^XZ`;

    return zpl;
}

export default {
    textToZPLGraphic,
    buildThaiLabel,
};