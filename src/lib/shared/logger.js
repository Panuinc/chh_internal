function createConsoleLogger(useCaseName) {
  return {
    start: (data) => console.log(`[${useCaseName}] start`, data),
    success: (data) => console.log(`[${useCaseName}] success`, data),
    warn: (message, data) => console.warn(`[${useCaseName}] ${message}`, data),
    error: (data) => console.error(`[${useCaseName}] error`, data),
  };
}

export function createLogger(useCaseName) {
  return createConsoleLogger(useCaseName);
}

export function handlePrismaUniqueError(error, field, value) {
  if (error?.code === "P2002") {
    const { ConflictError } = require("./errors");
    throw new ConflictError(field, value);
  }
  throw error;
}
