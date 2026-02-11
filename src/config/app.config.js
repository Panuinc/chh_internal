export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE_SIZE: 20,
};

export const TIMEOUTS = {
  API_DEFAULT: 30000,
  API_LONG: 60000,
  API_SHORT: 5000,

  BC_CONNECTION: 5000,
  BC_STATUS: 10000,
  BC_COMMAND: 30000,
  BC_HEALTH_CHECK: 5000,

  PRINTER_CONNECTION: 5000,
  PRINTER_STATUS: 10000,
  PRINTER_COMMAND: 30000,
  PRINTER_HEALTH_CHECK: 5000,

  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  REDIRECT_DELAY: 1500,
};

export const RATE_LIMITS = {
  API_GENERAL: {
    points: 100,
    duration: 60,
  },
  API_STRICT: {
    points: 20,
    duration: 60,
  },

  AUTH_LOGIN: {
    points: 5,
    duration: 300,
    blockDuration: 900,
  },

  UPLOAD: {
    points: 10,
    duration: 60,
  },
};

export const CACHE = {
  REVALIDATE_SHORT: 60,
  REVALIDATE_MEDIUM: 300,
  REVALIDATE_LONG: 3600,
  REVALIDATE_DAY: 86400,

  BC_ITEMS_TTL: 300,
  BC_ORDERS_TTL: 60,
  BC_CUSTOMERS_TTL: 600,
};

export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  MAX_FILES: 10,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "text/plain"],
};

export const AUTH = {
  SESSION_MAX_AGE: 8 * 60 * 60,
  SESSION_UPDATE_AGE: 60 * 60,
  TOKEN_BUFFER_MS: 60000,
};

export const RETRY = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  BACKOFF_MULTIPLIER: 2,
  MAX_RETRY_DELAY: 10000,
};

export const STATUS_COLORS = {
  connected: "success",
  disconnected: "danger",
  checking: "warning",
  error: "danger",

  Active: "success",
  Inactive: "default",
  Blocked: "danger",

  CheckIn: "warning",
  CheckOut: "success",
};

export const DATE_FORMATS = {
  DISPLAY_DATE: "DD/MM/YYYY",
  DISPLAY_DATETIME: "DD/MM/YYYY HH:mm",
  DISPLAY_TIME: "HH:mm",
  ISO_DATE: "YYYY-MM-DD",
  ISO_DATETIME: "YYYY-MM-DDTHH:mm:ss",
};

export const MESSAGES = {
  SUCCESS: {
    FETCH: "Data fetched successfully",
    CREATE: "Data created successfully",
    UPDATE: "Data updated successfully",
    DELETE: "Data deleted successfully",
    UPLOAD: "File uploaded successfully",
  },
  ERROR: {
    GENERIC: "An error occurred. Please try again.",
    NOT_FOUND: "Data not found",
    UNAUTHORIZED: "Unauthorized access",
    VALIDATION: "Invalid data",
    SERVER_ERROR: "A server error occurred",
    RATE_LIMIT: "Too many requests. Please wait a moment.",
  },
};

export const BC_CONFIG = {
  ENDPOINTS: {
    SALES_ORDERS: "/salesOrders",
    ITEMS: "/items",
    CUSTOMERS: "/customers",
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 1000,
    MAX_PAGE_SIZE: 5000,
  },
};

export const PRINTER_CONFIG = {
  dotsPerMm: 11.8,
  padding: { top: 2, bottom: 5, left: 5, right: 5 },
  LABEL_SIZES: {
    STANDARD: { width: 100, height: 30 },
    RFID: { width: 73, height: 21 },
    PACKING_SLIP: { width: 100, height: 150 },
  },
};

const appConfig = {
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

export default appConfig;
