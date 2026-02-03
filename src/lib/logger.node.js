import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import moment from "moment-timezone";
import fs from "fs";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (err) {
  console.error("Failed to create log directory:", err);
}

const timeZone = "Asia/Bangkok";

const fileTransport = new DailyRotateFile({
  filename: path.join(logDir, "%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxFiles: "30d",
  zippedArchive: true,
});

fileTransport.on("error", (error) => {
  console.error("File transport error:", error);
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

export default logger;
