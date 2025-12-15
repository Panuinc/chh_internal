/**
 * Shared Logger Helper
 * Create scoped logger for use cases
 */

import logger from "@/lib/logger.node";

/**
 * Create a scoped logger for use case
 * @param {string} useCaseName 
 */
export function createLogger(useCaseName) {
  return {
    start: (data) => logger.info(`${useCaseName} start`, data),
    success: (data) => logger.info(`${useCaseName} success`, data),
    warn: (message, data) => logger.warn(`${useCaseName} ${message}`, data),
    error: (data) => logger.error(`${useCaseName} error`, data),
  };
}

/**
 * Handle Prisma unique constraint error (P2002)
 * @param {unknown} error 
 * @param {string} field 
 * @param {string} value 
 */
export function handlePrismaUniqueError(error, field, value) {
  if (error?.code === "P2002") {
    const { ConflictError } = require("./errors");
    throw new ConflictError(field, value);
  }
  throw error;
}