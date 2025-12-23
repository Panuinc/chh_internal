/**
 * EPC (Electronic Product Code) Generator
 * รองรับหลาย format ตามมาตรฐาน GS1 และ Custom
 */

// ============================================
// EPC Generation Functions
// ============================================

/**
 * Generate SGTIN-96 EPC (มาตรฐาน GS1)
 * @param {Object} params
 * @param {string} params.companyPrefix - GS1 Company Prefix (6-12 digits)
 * @param {string} params.itemRef - Item Reference Number
 * @param {string} params.serial - Serial Number
 * @returns {string} 24 character hex EPC
 */
export function generateSGTIN96({ companyPrefix, itemRef, serial }) {
  const header = '30';
  const filter = '1';
  const partition = '5';
  
  const paddedCompany = companyPrefix.padStart(7, '0');
  const paddedItem = itemRef.padStart(6, '0');
  const paddedSerial = serial.padStart(11, '0');
  
  const binaryString = 
    parseInt(header, 16).toString(2).padStart(8, '0') +
    parseInt(filter, 10).toString(2).padStart(3, '0') +
    parseInt(partition, 10).toString(2).padStart(3, '0') +
    parseInt(paddedCompany, 10).toString(2).padStart(24, '0') +
    parseInt(paddedItem, 10).toString(2).padStart(20, '0') +
    parseInt(paddedSerial, 10).toString(2).padStart(38, '0');
  
  let hexEPC = '';
  for (let i = 0; i < binaryString.length; i += 4) {
    hexEPC += parseInt(binaryString.substr(i, 4), 2).toString(16).toUpperCase();
  }
  
  return hexEPC.padEnd(24, '0');
}

/**
 * Generate Simple EPC (สำหรับ internal tracking)
 * @param {Object} params
 * @param {string} params.prefix - Prefix (max 4 chars)
 * @param {string} params.itemNumber - Item number
 * @param {string|number} params.sequence - Sequence number
 * @returns {string} 24 character hex EPC
 */
export function generateSimpleEPC({ prefix = 'PK', itemNumber, sequence }) {
  const header = 'E2';
  
  let prefixHex = '';
  for (let i = 0; i < Math.min(prefix.length, 4); i++) {
    prefixHex += prefix.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0');
  }
  prefixHex = prefixHex.padEnd(8, '0');
  
  const itemHex = parseInt(itemNumber.replace(/\D/g, '') || '0', 10)
    .toString(16).toUpperCase().padStart(8, '0').slice(-8);
  
  const seqHex = parseInt(sequence, 10)
    .toString(16).toUpperCase().padStart(6, '0').slice(-6);
  
  return (header + prefixHex + itemHex + seqHex).slice(0, 24);
}

/**
 * Generate Unique EPC (timestamp + random)
 * @param {Object} params
 * @param {string} params.prefix - Prefix (max 3 chars)
 * @returns {string} 24 character hex EPC
 */
export function generateUniqueEPC({ prefix = 'UID' } = {}) {
  const timestamp = Date.now().toString(16).toUpperCase();
  const random = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
  
  let prefixHex = '';
  for (let i = 0; i < Math.min(prefix.length, 3); i++) {
    prefixHex += prefix.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0');
  }
  
  return ('E2' + prefixHex + timestamp + random).slice(0, 24).toUpperCase();
}

// ============================================
// EPC Service
// ============================================

let serialCounter = 0;

export const EPCService = {
  /**
   * Generate EPC based on mode
   * @param {Object} item - Item object
   * @param {Object} options - Options
   * @param {string} options.mode - 'simple' | 'sgtin96' | 'unique'
   */
  generate(item, options = {}) {
    const mode = options.mode || 'simple';
    
    switch (mode) {
      case 'sgtin96':
        return generateSGTIN96({
          companyPrefix: options.companyPrefix || '0885000',
          itemRef: item.number.replace(/\D/g, '').slice(-6),
          serial: item.serial || this.getNextSerial(),
        });
        
      case 'unique':
        return generateUniqueEPC({ prefix: options.prefix || 'PK' });
        
      default:
        return generateSimpleEPC({
          prefix: options.prefix || 'PK',
          itemNumber: item.number,
          sequence: item.serial || this.getNextSerial(),
        });
    }
  },
  
  getNextSerial() {
    serialCounter++;
    return Date.now().toString().slice(-10) + serialCounter.toString().padStart(4, '0');
  },
  
  validate(epc) {
    if (!epc || typeof epc !== 'string') return { valid: false, error: 'EPC is required' };
    if (!/^[0-9A-Fa-f]+$/.test(epc)) return { valid: false, error: 'EPC must be hexadecimal' };
    if (epc.length !== 24) return { valid: false, error: 'EPC must be 24 characters' };
    return { valid: true };
  },
  
  parse(epc) {
    const header = epc.substring(0, 2);
    const types = { '30': 'SGTIN-96', '31': 'SGTIN-198', 'E2': 'Custom', '35': 'SSCC-96' };
    return {
      raw: epc,
      header,
      type: types[header.toUpperCase()] || 'Unknown',
      uri: `urn:epc:tag:${epc}`,
    };
  },
};

export default { generateSGTIN96, generateSimpleEPC, generateUniqueEPC, EPCService };