import logger from "@/lib/logger.node";

export function createLogger(useCaseName) {
  return {
    start: (data) => logger.info(`${useCaseName} start`, data),
    success: (data) => logger.info(`${useCaseName} success`, data),
    warn: (message, data) => logger.warn(`${useCaseName} ${message}`, data),
    error: (data) => logger.error(`${useCaseName} error`, data),
  };
}

export function handlePrismaUniqueError(error, field, value) {
  if (error?.code === "P2002") {
    const { ConflictError } = require("./errors");
    throw new ConflictError(field, value);
  }
  throw error;
}
