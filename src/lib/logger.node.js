import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import moment from "moment-timezone";

const timeZone = "Asia/Bangkok";

// ตรวจสอบว่าอยู่ใน Node.js environment หรือไม่
const isNodeEnvironment = typeof process !== 'undefined' && process.cwd;

let logger;

if (isNodeEnvironment) {
  // Dynamic import สำหรับ Node.js modules
  const fs = require("fs");
  const path = require("path");
  
  const logDir = path.join(process.cwd(), "logs");

  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  } catch (err) {
    // Silent fail in edge runtime
  }

  const fileTransport = new DailyRotateFile({
    filename: path.join(logDir, "%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxFiles: "30d",
    zippedArchive: true,
  });

  fileTransport.on("error", () => {
    // Silent fail
  });

  logger = winston.createLogger({
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
      })
    ),
    transports: [
      fileTransport,
      new winston.transports.Console({
        level: "debug",
      }),
    ],
  });

  logger.info("Logger initialized successfully", { logDir });
} else {
  // Fallback logger สำหรับ Edge Runtime
  logger = {
    info: (message, meta) => console.log(`[INFO] ${message}`, meta || ""),
    error: (message, meta) => console.error(`[ERROR] ${message}`, meta || ""),
    warn: (message, meta) => console.warn(`[WARN] ${message}`, meta || ""),
    debug: (message, meta) => console.debug(`[DEBUG] ${message}`, meta || ""),
  };
}

export default logger;
