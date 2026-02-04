/**
 * Global Application Configuration
 * รวมค่า Constant ที่ใช้ทั่วทั้งแอปพลิเคชัน
 */

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 1000,
  DEFAULT_PAGE_SIZE: 1000,
  LARGE_PAGE_SIZE: 1000000, // สำหรับ getAll ที่ไม่ต้องการ paginate จริงๆ
};

// Timeouts (milliseconds)
export const TIMEOUTS = {
  // API Timeouts
  API_DEFAULT: 30000,
  API_LONG: 60000,
  API_SHORT: 5000,
  
  // External Service Timeouts
  BC_CONNECTION: 5000,
  BC_STATUS: 10000,
  BC_COMMAND: 30000,
  BC_HEALTH_CHECK: 5000,
  
  // Printer Timeouts
  PRINTER_CONNECTION: 5000,
  PRINTER_STATUS: 10000,
  PRINTER_COMMAND: 30000,
  PRINTER_HEALTH_CHECK: 5000,
  
  // UI Timeouts
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  REDIRECT_DELAY: 1500,
};

// Rate Limiting
export const RATE_LIMITS = {
  // API Routes
  API_GENERAL: {
    points: 100,        // จำนวน request
    duration: 60,       // ภายในกี่วินาที
  },
  API_STRICT: {
    points: 20,
    duration: 60,
  },
  // Auth Routes
  AUTH_LOGIN: {
    points: 5,          // 5 ครั้ง
    duration: 300,      // ภายใน 5 นาที
    blockDuration: 900, // บล็อก 15 นาทีถ้าเกิน
  },
  // Upload Routes
  UPLOAD: {
    points: 10,
    duration: 60,
  },
};

// Cache Configuration
export const CACHE = {
  // Revalidate times (seconds)
  REVALidate_SHORT: 60,      // 1 นาที
  REVALidate_MEDIUM: 300,    // 5 นาที
  REVALidate_LONG: 3600,     // 1 ชั่วโมง
  REVALidate_DAY: 86400,     // 1 วัน
  
  // Static Data (BC)
  BC_ITEMS_TTL: 300,         // 5 นาที
  BC_ORDERS_TTL: 60,         // 1 นาที
  BC_CUSTOMERS_TTL: 600,     // 10 นาที
};

// File Upload
export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain'],
};

// Session & Auth
export const AUTH = {
  SESSION_MAX_AGE: 8 * 60 * 60, // 8 ชั่วโมง (วินาที)
  SESSION_UPDATE_AGE: 60 * 60,  // Refresh ทุก 1 ชั่วโมง
  TOKEN_BUFFER_MS: 60000,       // Buffer ก่อน token หมดอายุ
};

// Retry Configuration
export const RETRY = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,           // 1 วินาที
  BACKOFF_MULTIPLIER: 2,
  MAX_RETRY_DELAY: 10000,      // 10 วินาที
};

// Status Colors (สำหรับ UI)
export const STATUS_COLORS = {
  // Connection Status
  connected: 'success',
  disconnected: 'danger',
  checking: 'warning',
  error: 'danger',
  
  // Record Status
  Active: 'success',
  Inactive: 'default',
  Blocked: 'danger',
  
  // Visitor Status
  CheckIn: 'warning',
  CheckOut: 'success',
};

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY_DATE: 'DD/MM/YYYY',
  DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
  DISPLAY_TIME: 'HH:mm',
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss',
};

// API Response Messages
export const MESSAGES = {
  SUCCESS: {
    FETCH: 'ดึงข้อมูลสำเร็จ',
    CREATE: 'สร้างข้อมูลสำเร็จ',
    UPDATE: 'อัปเดตข้อมูลสำเร็จ',
    DELETE: 'ลบข้อมูลสำเร็จ',
    UPLOAD: 'อัปโหลดไฟล์สำเร็จ',
  },
  ERROR: {
    GENERIC: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    NOT_FOUND: 'ไม่พบข้อมูล',
    UNAUTHORIZED: 'ไม่มีสิทธิ์เข้าถึง',
    VALIDATION: 'ข้อมูลไม่ถูกต้อง',
    SERVER_ERROR: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์',
    RATE_LIMIT: 'คำขอมากเกินไป กรุณารอสักครู่',
  },
};

// Business Central
export const BC_CONFIG = {
  ENDPOINTS: {
    SALES_ORDERS: '/salesOrders',
    ITEMS: '/items',
    CUSTOMERS: '/customers',
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 1000,
    MAX_PAGE_SIZE: 5000,
  },
};

// Printer Configuration
export const PRINTER_CONFIG = {
  dotsPerMm: 11.8,
  padding: { top: 2, bottom: 5, left: 5, right: 5 },
  LABEL_SIZES: {
    STANDARD: { width: 100, height: 30 },
    RFID: { width: 73, height: 21 },
    PACKING_SLIP: { width: 100, height: 150 },
  },
};

export default {
  PAGINATION,
  TIMEOUTS,
  RATE_LIMITS,
  CACHE,
  UPLOAD,
  AUTH,
  RETRY,
  STATUS_COLORS,
  DATE_FORMATS,
  MESSAGES,
  BC_CONFIG,
  PRINTER_CONFIG,
};
