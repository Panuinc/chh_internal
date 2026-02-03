export function createLogger(useCaseName) {
  let logger;
  try {
    logger = require("@/lib/logger.node").default;
  } catch {
    logger = console;
  }

  return {
    start: (data) =>
      logger.info?.(`${useCaseName} start`, data) ??
      console.log(`${useCaseName} start`, data),
    success: (data) =>
      logger.info?.(`${useCaseName} success`, data) ??
      console.log(`${useCaseName} success`, data),
    warn: (message, data) =>
      logger.warn?.(`${useCaseName} ${message}`, data) ??
      console.warn(`${useCaseName} ${message}`, data),
    error: (data) =>
      logger.error?.(`${useCaseName} error`, data) ??
      console.error(`${useCaseName} error`, data),
  };
}

export function handlePrismaUniqueError(error, field, value) {
  if (error?.code === "P2002") {
    const { ConflictError } = require("./errors");
    throw new ConflictError(field, value);
  }
  throw error;
}
