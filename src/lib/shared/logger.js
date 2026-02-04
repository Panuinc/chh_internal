import { getRequestId } from "@/lib/requestContext";
import winstonLogger from "@/lib/logger.node";

function createWinstonWrapper(useCaseName) {
  const log = (level, message, data) => {
    const requestId = getRequestId();
    const logData = {
      useCase: useCaseName,
      requestId,
      ...data,
    };
    
    winstonLogger.log(level, `[${useCaseName}] ${message}`, logData);
  };

  return {
    start: (data) => log("info", "start", data),
    success: (data) => log("info", "success", data),
    warn: (message, data) => log("warn", message, data),
    error: (data) => log("error", "error", data),
  };
}

export function createLogger(useCaseName) {
  return createWinstonWrapper(useCaseName);
}

export function handlePrismaUniqueError(error, field, value) {
  if (error?.code === "P2002") {
    const { ConflictError } = require("./errors");
    throw new ConflictError(field, value);
  }
  throw error;
}
