/**
 * ZPL Builder for Chainway CP30 RFID Printer
 * 
 * ZPL (Zebra Programming Language) Commands Reference:
 * - ^XA = Start format
 * - ^XZ = End format
 * - ^FO = Field Origin (x,y position)
 * - ^FD = Field Data
 * - ^FS = Field Separator
 * - ^A0 = Scalable font
 * - ^BY = Bar code field default
 * - ^BC = Code 128 bar code
 * - ^BQ = QR Code
 * - ^RF = RFID field
 * - ^RFW = RFID Write
 * - ^RFR = RFID Read
 * - ^RS = RFID Setup
 * - ^PQ = Print Quantity
 */

// ============================================
// RFID EPC Generation Functions
// ============================================

/**
 * Generate SGTIN-96 EPC (Serial Global Trade Item Number)
 * ใช้สำหรับสินค้าทั่วไปตามมาตรฐาน GS1
 * 
 * @param {Object} params
 * @param {string} params.companyPrefix - GS1 Company Prefix (6-12 digits)
 * @param {string} params.itemRef - Item Reference Number
 * @param {string} params.serial - Serial Number (unique per item)
 * @returns {string} - 24 character hex EPC
 */
export function generateSGTIN96(params) {
  const { companyPrefix, itemRef, serial } = params;
  
  // SGTIN-96 Header = 0x30 (48 in decimal)
  const header = '30';
  
  // Filter value (3 bits) - 1 = Point of Sale trade item
  const filter = '1';
  
  // Partition value (3 bits) - determines split between company prefix and item ref
  // Partition 5 = 7-digit company prefix, 6-digit item ref
  const partition = '5';
  
  // Pad company prefix and item reference
  const paddedCompany = companyPrefix.padStart(7, '0');
  const paddedItem = itemRef.padStart(6, '0');
  const paddedSerial = serial.padStart(11, '0');
  
  // Convert to binary then to hex
  const binaryString = 
    parseInt(header, 16).toString(2).padStart(8, '0') +
    parseInt(filter, 10).toString(2).padStart(3, '0') +
    parseInt(partition, 10).toString(2).padStart(3, '0') +
    parseInt(paddedCompany, 10).toString(2).padStart(24, '0') +
    parseInt(paddedItem, 10).toString(2).padStart(20, '0') +
    parseInt(paddedSerial, 10).toString(2).padStart(38, '0');
  
  // Convert binary to hex (96 bits = 24 hex characters)
  let hexEPC = '';
  for (let i = 0; i < binaryString.length; i += 4) {
    const nibble = binaryString.substr(i, 4);
    hexEPC += parseInt(nibble, 2).toString(16).toUpperCase();
  }
  
  return hexEPC.padEnd(24, '0');
}

/**
 * Generate simple sequential EPC
 * ใช้สำหรับทดสอบหรือ internal tracking ที่ไม่ต้องใช้ GS1
 * 
 * @param {Object} params
 * @param {string} params.prefix - Custom prefix (max 8 chars)
 * @param {string} params.itemNumber - Item number
 * @param {string|number} params.sequence - Sequence number
 * @returns {string} - 24 character hex EPC
 */
export function generateSimpleEPC(params) {
  const { prefix = 'PK', itemNumber, sequence } = params;
  
  // Header for proprietary EPC
  const header = 'E2';
  
  // Convert prefix to hex
  let prefixHex = '';
  for (let i = 0; i < prefix.length && i < 4; i++) {
    prefixHex += prefix.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0');
  }
  prefixHex = prefixHex.padEnd(8, '0');
  
  // Item number as hex (max 6 bytes)
  const itemHex = parseInt(itemNumber.replace(/\D/g, '') || '0', 10)
    .toString(16)
    .toUpperCase()
    .padStart(8, '0')
    .slice(-8);
  
  // Sequence as hex (max 4 bytes)
  const seqHex = parseInt(sequence, 10)
    .toString(16)
    .toUpperCase()
    .padStart(6, '0')
    .slice(-6);
  
  return (header + prefixHex + itemHex + seqHex).slice(0, 24);
}

/**
 * Generate EPC from timestamp + random
 * สำหรับ unique identifier ที่ไม่ซ้ำกัน
 */
export function generateUniqueEPC(params = {}) {
  const { prefix = 'UID' } = params;
  
  const timestamp = Date.now().toString(16).toUpperCase();
  const random = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
  
  let prefixHex = '';
  for (let i = 0; i < prefix.length && i < 3; i++) {
    prefixHex += prefix.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0');
  }
  
  return ('E2' + prefixHex + timestamp + random).slice(0, 24).toUpperCase();
}

// ============================================
// ZPL Command Builder Functions
// ============================================

/**
 * Build ZPL command สำหรับ print + encode RFID tag
 * 
 * @param {Object} options
 * @param {string} options.epcData - EPC data (24 hex characters)
 * @param {string} options.itemNumber - Item number to print
 * @param {string} options.displayName - Display name to print
 * @param {string} [options.displayName2] - Second line display name
 * @param {string} [options.barcodeData] - Barcode data (defaults to itemNumber)
 * @param {number} [options.quantity=1] - Number of labels to print
 * @param {Object} [options.labelSize] - Label dimensions
 * @returns {string} - ZPL command string
 */
export function buildRFIDLabel(options) {
  const {
    epcData,
    itemNumber,
    displayName,
    displayName2 = '',
    barcodeData,
    quantity = 1,
    labelSize = { width: 100, height: 80 }, // 100mm x 80mm
  } = options;

  // Convert mm to dots (300 DPI = 11.8 dots/mm for CP30)
  const dpmm = 11.8;
  const labelWidth = Math.round(labelSize.width * dpmm);
  const labelHeight = Math.round(labelSize.height * dpmm);

  // Positions adjusted for 100x80mm label
  const margin = 50;
  const barcodeHeight = 150;

  // *** Working format for Chainway CP30 ***
  let zpl = `^XA^JUS^XZ^XA^MMT^PW${labelWidth}^LL${labelHeight}`;
  zpl += `^RS8^RFW,H,1,12,1^FD${epcData}^FS`;
  zpl += `^FO${margin},50^A0N,70,70^FD${itemNumber}^FS`;
  zpl += `^FO${margin},140^A0N,50,50^FD${displayName.substring(0, 35)}^FS`;
  if (displayName2) {
    zpl += `^FO${margin},210^A0N,40,40^FD${displayName2.substring(0, 40)}^FS`;
  }
  zpl += `^FO${margin},350^BY3,3,${barcodeHeight}^BCN,,Y,N^FD${barcodeData || itemNumber}^FS`;
  zpl += `^PQ${quantity}^XZ`;

  return zpl;
}

/**
 * Build ZPL command สำหรับ print label แบบไม่มี RFID
 * Default size: 100mm x 80mm
 */
export function buildBarcodeLabel(options) {
  const {
    itemNumber,
    displayName,
    displayName2 = '',
    barcodeData,
    quantity = 1,
    labelSize = { width: 100, height: 80 }, // 100mm x 80mm
  } = options;

  // 300 DPI = 11.8 dots/mm (for Chainway CP30)
  const dpmm = 11.8;
  const labelWidth = Math.round(labelSize.width * dpmm);
  const labelHeight = Math.round(labelSize.height * dpmm);
  
  // Positions adjusted for 100x80mm label
  const margin = 50;
  const barcodeHeight = 150;

  // *** Working format for Chainway CP30 ***
  let zpl = `^XA^JUS^XZ^XA^MMT^PW${labelWidth}^LL${labelHeight}`;
  zpl += `^FO${margin},50^A0N,70,70^FD${itemNumber}^FS`;
  zpl += `^FO${margin},140^A0N,50,50^FD${displayName.substring(0, 35)}^FS`;
  if (displayName2) {
    zpl += `^FO${margin},210^A0N,40,40^FD${displayName2.substring(0, 40)}^FS`;
  }
  zpl += `^FO${margin},350^BY3,3,${barcodeHeight}^BCN,,Y,N^FD${barcodeData || itemNumber}^FS`;
  zpl += `^PQ${quantity}^XZ`;
  
  return zpl;
}

/**
 * Build ZPL command สำหรับ QR Code + RFID
 */
export function buildQRCodeRFIDLabel(options) {
  const {
    epcData,
    itemNumber,
    displayName,
    qrData,
    quantity = 1,
    labelSize = { width: 100, height: 60 },
  } = options;

  const dpmm = 8;
  const labelWidth = labelSize.width * dpmm;
  const labelHeight = labelSize.height * dpmm;
  const margin = 40;

  return `
^XA
^MMT
^PW${labelWidth}
^LL${labelHeight}
^LS0

^RS8
^RFW,H,1,12,1^FD${epcData}^FS

^FT${margin},50^A0N,40,40^FH\\^CI28^FD${itemNumber}^FS^CI27
^FT${margin},95^A0N,32,32^FH\\^CI28^FD${displayName.substring(0, 25)}^FS^CI27

^FT${labelWidth - 200},100^BQN,2,5
^FDQA,${qrData || itemNumber}^FS

^PQ${quantity},0,1,Y
^XZ
`.trim();
}

/**
 * Build ZPL command สำหรับ read RFID tag
 */
export function buildRFIDReadCommand() {
  return `
^XA
^RFR,H,0,12,1^FN1^FS
^HV1,,EPC:^FS
^XZ
`.trim();
}

/**
 * Build ZPL command สำหรับ get printer status
 */
export function buildStatusCommand() {
  return '~HS';
}

/**
 * Build ZPL command สำหรับ calibrate printer
 */
export function buildCalibrateCommand() {
  return '~JC';
}

/**
 * Build batch labels (multiple items)
 */
export function buildBatchRFIDLabels(items, options = {}) {
  const { generateEPC = generateSimpleEPC } = options;
  
  return items.map((item, index) => {
    const epcData = generateEPC({
      prefix: options.prefix || 'PK',
      itemNumber: item.number,
      sequence: item.serial || (Date.now() + index).toString(),
    });
    
    return buildRFIDLabel({
      epcData,
      itemNumber: item.number,
      displayName: item.displayName,
      displayName2: item.displayName2,
      barcodeData: item.number,
      quantity: item.quantity || 1,
      labelSize: options.labelSize,
    });
  }).join('\n');
}

// ============================================
// Export all functions
// ============================================
export default {
  // EPC Generators
  generateSGTIN96,
  generateSimpleEPC,
  generateUniqueEPC,
  
  // ZPL Builders
  buildRFIDLabel,
  buildBarcodeLabel,
  buildQRCodeRFIDLabel,
  buildRFIDReadCommand,
  buildStatusCommand,
  buildCalibrateCommand,
  buildBatchRFIDLabels,
};