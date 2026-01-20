import { ZPL_CONFIG } from "./config.js";

export function mmToDots(mm) {
  return Math.round(mm * ZPL_CONFIG.dotsPerMm);
}

export function sanitizeText(text, maxLen = 100) {
  if (!text) return "";
  return String(text).replace(/[\^~]/g, "").substring(0, maxLen);
}

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

export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "https://your-app.com";
}

export function generateOrderQRUrl(order) {
  return `${getBaseUrl()}/sales/salesOrderOnline/${order.id}`;
}

export function calculateTotalPieces(order) {
  return getItemLines(order).reduce((sum, line) => sum + (line.quantity || 0), 0);
}

export function getItemLines(order) {
  return (order?.salesOrderLines || []).filter((l) => l.lineType === "Item");
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}