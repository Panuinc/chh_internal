export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  BAD_GATEWAY: 502,
};

export const SUCCESS_MESSAGES = {
  FETCH_SUCCESS: "Data fetched successfully",
  CREATE_SUCCESS: "Created successfully",
  UPDATE_SUCCESS: "Updated successfully",
  DELETE_SUCCESS: "Deleted successfully",
};

export const ERROR_MESSAGES = {
  NO_RESPONSE: "No response from Business Central",
  INVALID_FORMAT: "Invalid response format from BC",
  NOT_FOUND: "Resource not found",
  AUTH_FAILED: "Authentication failed",
  VALIDATION_ERROR: "Validation error",
  INTERNAL_ERROR: "An unexpected error occurred",
};

export const ERROR_CODES = {
  NO_RESPONSE: "BC_NO_RESPONSE",
  INVALID_FORMAT: "BC_INVALID_FORMAT",
  NOT_FOUND: "BC_NOT_FOUND",
  AUTH_FAILED: "BC_AUTH_FAILED",
  API_ERROR: "BC_API_ERROR",
  VALIDATION_ERROR: "BC_VALIDATION_ERROR",
  INTERNAL_ERROR: "BC_INTERNAL_ERROR",
  MISSING_PARAM: "BC_MISSING_PARAM",
};

export const ENDPOINTS = {
  SALES_INVOICES: "/salesInvoices",
  SALES_ORDERS: "/salesOrders",
  CUSTOMERS: "/customers",
  ITEMS: "/items",
  VENDORS: "/vendors",
  PURCHASE_INVOICES: "/purchaseInvoices",
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 1000,
  DEFAULT_PAGE_SIZE: 1000,
};

export const bcConfig = {
  auth: {
    url: process.env.BC_AUTH_URL,
    clientId: process.env.BC_CLIENT_ID,
    clientSecret: process.env.BC_CLIENT_SECRET,
    scope: process.env.BC_SCOPE,
  },
  api: {
    baseUrl: process.env.BC_BASE_URL,
    tenantId: process.env.BC_TENANT_ID,
    environment: process.env.BC_ENVIRONMENT,
    company: process.env.BC_COMPANY,
  },
  options: {
    defaultPageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    tokenBufferMs: 60000,
    maxRetries: 2,
    debug: process.env.BC_DEBUG === "true",
  },
};

export function validateConfig() {
  const required = [
    "BC_AUTH_URL",
    "BC_CLIENT_ID",
    "BC_CLIENT_SECRET",
    "BC_SCOPE",
    "BC_BASE_URL",
    "BC_TENANT_ID",
    "BC_ENVIRONMENT",
    "BC_COMPANY",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required BC environment variables: ${missing.join(", ")}`
    );
  }
}
