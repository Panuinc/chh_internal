// Edge-safe logger that doesn't depend on Node.js APIs
// This file is used by middleware, client components, and Edge Runtime contexts

import { getRequestId } from "@/lib/requestContext";

function createConsoleLogger(useCaseName) {
  const log = (level, message, data) => {
    const requestId = getRequestId?.() || "";
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${useCaseName}]${requestId ? ` [${requestId}]` : ""}`;

    const logData = {
      useCase: useCaseName,
      requestId,
      ...data,
    };

    switch (level) {
      case "error":
        console.error(prefix, message, logData);
        break;
      case "warn":
        console.warn(prefix, message, logData);
        break;
      case "debug":
        console.debug(prefix, message, logData);
        break;
      default:
        console.log(prefix, message, logData);
    }
  };

  return {
    start: (data) => log("info", "start", data),
    success: (data) => log("info", "success", data),
    warn: (message, data) => log("warn", message, data),
    error: (data) => log("error", "error", data),
    info: (message, data) => log("info", message, data),
    debug: (message, data) => log("debug", message, data),
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
