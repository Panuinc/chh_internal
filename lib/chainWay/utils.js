import { ZPL_CONFIG } from "./config.js";

export function mmToDots(mm) {
  return Math.round(mm * ZPL_CONFIG.dotsPerMm);
}

export const mm = mmToDots;

export function sanitizeText(text, maxLen = 100) {
  if (!text) return "";
  return String(text).replace(/[\^~]/g, "").substring(0, maxLen);
}

export const sanitize = sanitizeText;

export function splitText(text, maxCharsPerLine = 35) {
  if (!text || text.length <= maxCharsPerLine) {
    return [text || ""];
  }

  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  const result = [];
  for (const line of lines) {
    if (line.length <= maxCharsPerLine) {
      result.push(line);
    } else {
      for (let i = 0; i < line.length; i += maxCharsPerLine) {
        result.push(line.substring(i, i + maxCharsPerLine));
      }
    }
  }

  return result.slice(0, 3);
}

export function generateOrderQRUrl(order) {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/sales/salesOrderOnline/${order.id}`;
}

export const getQRUrl = generateOrderQRUrl;

export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "https://your-app.com";
}

export function calculateTotalPieces(order) {
  const itemLines = (order?.salesOrderLines || []).filter(
    (l) => l.lineType === "Item",
  );
  return itemLines.reduce((sum, line) => sum + (line.quantity || 0), 0);
}

export function getItemLines(order) {
  return (order?.salesOrderLines || []).filter((l) => l.lineType === "Item");
}

export function createLogger(context) {
  const isDev = process.env.NODE_ENV !== "production";
  return {
    start: (data) =>
      isDev && console.log(`[${context}] Start:`, JSON.stringify(data)),
    success: (data) =>
      isDev && console.log(`[${context}] Success:`, JSON.stringify(data)),
    error: (data) => console.error(`[${context}] Error:`, JSON.stringify(data)),
    info: (message) => isDev && console.log(`[${context}] ${message}`),
    warn: (message) => console.warn(`[${context}] ${message}`),
  };
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default {
  mmToDots,
  mm,
  sanitizeText,
  sanitize,
  splitText,
  generateOrderQRUrl,
  getQRUrl,
  getBaseUrl,
  calculateTotalPieces,
  getItemLines,
  createLogger,
  delay,
};
