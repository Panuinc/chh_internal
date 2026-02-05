import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import moment from "moment-timezone";
import fs from "fs";
import path from "path";

const timeZone = "Asia/Bangkok";

const logDir = path.join(process.cwd(), "logs");

try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (err) {
  // Silently fail if directory creation fails
}

const fileTransport = new DailyRotateFile({
  filename: path.join(logDir, "%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxFiles: "30d",
  zippedArchive: true,
});

fileTransport.on("error", () => {
  // Silently handle file transport errors
});

const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, ...meta }) => {
      const ts = moment().tz(timeZone).format("YYYY-MM-DD HH:mm:ss");
      const metaStr =
        Object.keys(meta).length > 0
          ? " " + JSON.stringify(meta, null, 0)
          : "";
      return `[${ts}] [${level.toUpperCase()}] ${message}${metaStr}`;
    }),
  ),
  transports: [
    fileTransport,
    new winston.transports.Console({
      level: "debug",
    }),
  ],
});

winstonLogger.info("Logger initialized successfully", { logDir });

/**
 * Create a logger instance for a specific use case
 * Compatible with the createLogger from @/lib/shared/server
 * @param {string} useCaseName - Name of the use case (e.g., "CreateVisitorUseCase")
 * @returns {Object} Logger instance with start, success, error, warn, info, debug methods
 */
export function createLogger(useCaseName) {
  return {
    start: (data) => winstonLogger.info(`${useCaseName} start`, data),
    success: (data) => winstonLogger.info(`${useCaseName} success`, data),
    error: (data) => winstonLogger.error(`${useCaseName} error`, data),
    warn: (message, data) => winstonLogger.warn(`${useCaseName} ${message}`, data),
    info: (message, data) => winstonLogger.info(`${useCaseName} ${message}`, data),
    debug: (message, data) => winstonLogger.debug(`${useCaseName} ${message}`, data),
  };
}

export default winstonLogger;
