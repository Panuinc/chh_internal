// Simple logger that works in both Node.js and Edge Runtime
// In Edge Runtime, falls back to console logging

function createConsoleLogger(useCaseName) {
  return {
    start: (data) => console.log(`[${useCaseName}] start`, data),
    success: (data) => console.log(`[${useCaseName}] success`, data),
    warn: (message, data) => console.warn(`[${useCaseName}] ${message}`, data),
    error: (data) => console.error(`[${useCaseName}] error`, data),
  };
}

export function createLogger(useCaseName) {
  // Always use console logger (simplest, works everywhere)
  return createConsoleLogger(useCaseName);
}

export function handlePrismaUniqueError(error, field, value) {
  if (error?.code === "P2002") {
    const { ConflictError } = require("./errors");
    throw new ConflictError(field, value);
  }
  throw error;
}
