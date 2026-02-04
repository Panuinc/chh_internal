import { getRequestId } from "@/lib/requestContext";

const isBrowser = typeof window !== "undefined";

const isEdgeRuntime = typeof process !== "undefined" && process.env.NEXT_RUNTIME === "edge";

const isFullNodeEnvironment =
  typeof process !== "undefined" &&
  typeof process.cwd === "function" &&
  !isEdgeRuntime &&
  !isBrowser;

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

let winstonLogger = null;
let winstonPromise = null;

async function loadWinstonLogger() {
  if (!isFullNodeEnvironment) {
    return null;
  }

  try {

    const modulePath = "@/lib/logger" + ".node";
    const module = await import( modulePath);
    return module.default || module;
  } catch {
    return null;
  }
}

function getWinstonLogger() {
  if (winstonLogger) return winstonLogger;

  if (isFullNodeEnvironment && !winstonPromise) {
    winstonPromise = loadWinstonLogger().then(logger => {
      winstonLogger = logger;
      return logger;
    });
  }

  return winstonLogger;
}

function createWinstonWrapper(useCaseName) {
  const nodeLogger = getWinstonLogger();

  if (!nodeLogger) {

    return createConsoleLogger(useCaseName);
  }

  const log = (level, message, data) => {
    const requestId = getRequestId?.();
    const logData = {
      useCase: useCaseName,
      requestId,
      ...data,
    };

    nodeLogger.log(level, `[${useCaseName}] ${message}`, logData);
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

  if (isFullNodeEnvironment) {
    return createWinstonWrapper(useCaseName);
  }
  return createConsoleLogger(useCaseName);
}

export function handlePrismaUniqueError(error, field, value) {
  if (error?.code === "P2002") {
    const { ConflictError } = require("./errors");
    throw new ConflictError(field, value);
  }
  throw error;
}
