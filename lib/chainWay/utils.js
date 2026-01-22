import { ZPL_CONFIG } from "./config.js";

export function mmToDots(mm) {
  return Math.round(mm * ZPL_CONFIG.dotsPerMm);
}

export function sanitizeText(text, maxLen = 100) {
  if (!text) return "";
  return String(text).replace(/[\^~]/g, "").substring(0, maxLen);
}

export function calculateTotalPieces(order) {
  return getItemLines(order).reduce(
    (sum, line) => sum + (line.quantity || 0),
    0,
  );
}

export function getItemLines(order) {
  return (order?.salesOrderLines || []).filter((l) => l.lineType === "Item");
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
