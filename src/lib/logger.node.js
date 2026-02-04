// This file should only be imported in Node.js environment (not Edge, not Browser)
// It uses Node.js-specific APIs like fs and Winston

const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const moment = require("moment-timezone");
const fs = require("fs");
const path = require("path");

const timeZone = "Asia/Bangkok";

const logDir = path.join(process.cwd(), "logs");

try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (err) {
  // Silent fail - will log to console only
}

const fileTransport = new DailyRotateFile({
  filename: path.join(logDir, "%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxFiles: "30d",
  zippedArchive: true,
});

fileTransport.on("error", () => {
  // Silent fail for file transport errors
});

const logger = winston.createLogger({
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

logger.info("Logger initialized successfully", { logDir });

module.exports = logger;
