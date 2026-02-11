/**
 * Thailand Post EMS Tracking Service
 * 
 * API Documentation: https://track.thailandpost.co.th/developerGuide
 * 
 * Thailand Post Tracking API v1 (REST) requires 2 steps:
 * 1. Request JWT Token: POST /authenticate/token
 *    - Header: Authorization: Token {static-token}
 *    - Response: {"token": "eyJ0eXAiOiJKV1QiLCJhbG...", "expire": "..."}
 *
 * 2. Track Parcel: POST /track
 *    - Header: Authorization: Token {jwt-token} (not Bearer!)
 *
 * Status Codes: See Thailand Post documentation
 */

import { createLogger } from "@/lib/logger.node";

const logger = createLogger("EMSService");

const THAILAND_POST_API_BASE = "https://trackapi.thailandpost.co.th/post/api/v1";

// Cache JWT token
let cachedToken = null;
let tokenExpireTime = null;

/**
 * Get JWT token from Thailand Post API
 * @returns {Promise<string>} JWT token
 */
async function getJWTToken() {
  const staticToken = process.env.THAILAND_POST_API_KEY;

  if (!staticToken) {
    throw new Error("Thailand Post API key is not configured");
  }

  // Check if we have a valid cached token
  if (cachedToken && tokenExpireTime && Date.now() < tokenExpireTime) {
    logger.info("Using cached JWT token");
    return cachedToken;
  }

  const cleanToken = staticToken.replace(/^["']|["']$/g, "").trim();
  const maskedKey = cleanToken.substring(0, 15) + "..." + cleanToken.substring(cleanToken.length - 10);
  
  // Debug: Show token being sent (be careful with security in production)
  logger.info("Requesting JWT token from Thailand Post", { 
    apiKeyPreview: maskedKey,
    tokenLength: cleanToken.length,
    firstChars: cleanToken.substring(0, 20),
    lastChars: cleanToken.substring(cleanToken.length - 10)
  });

  const response = await fetch(`${THAILAND_POST_API_BASE}/authenticate/token`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${cleanToken}`,
      "Content-Type": "application/json",
    },
  });

  const responseText = await response.text();
  logger.info("GetToken response", { status: response.status, body: responseText });

  if (!response.ok) {
    throw new Error(`Failed to get JWT token: ${response.status} - ${responseText}`);
  }

  const data = JSON.parse(responseText);
  
  if (!data.token) {
    throw new Error("Invalid response: no token received");
  }

  // Cache token and set expire time (1 month minus 1 hour for safety)
  cachedToken = data.token;
  tokenExpireTime = Date.now() + (29 * 24 * 60 * 60 * 1000); // 29 days
  
  logger.info("JWT token obtained successfully", { expire: data.expire });
  
  return cachedToken;
}

/**
 * Track EMS parcel by barcode
 * @param {string} barcode - EMS tracking number (e.g., EN123456789TH)
 * @returns {Promise<Object>} Tracking information
 */
export async function trackEMS(barcode) {
  if (!barcode || typeof barcode !== "string") {
    throw new Error("Invalid barcode provided");
  }

  // Validate EMS barcode format
  const emsPattern = /^[A-Z]{2}\d{9}[A-Z]{2}$/i;
  if (!emsPattern.test(barcode.trim())) {
    throw new Error("Invalid EMS barcode format. Expected format: EN123456789TH");
  }

  try {
    // Step 1: Get JWT token
    const jwtToken = await getJWTToken();
    
    // Step 2: Call track API with JWT token
    logger.info("Tracking EMS", { barcode: barcode.trim().toUpperCase() });

    const response = await fetch(`${THAILAND_POST_API_BASE}/track`, {
      method: "POST",
      headers: {
        // Important! Use "Token" not "Bearer"
        "Authorization": `Token ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "all",
        language: "TH",
        barcode: [barcode.trim().toUpperCase()],
      }),
    });

    const responseText = await response.text();
    logger.info("Track API response", { status: response.status, body: responseText.substring(0, 500) });

    if (!response.ok) {
      // If token expired, clear cache and retry once
      if (response.status === 401) {
        logger.info("Token may be expired, clearing cache and retrying");
        cachedToken = null;
        tokenExpireTime = null;
        
        const newToken = await getJWTToken();
        const retryResponse = await fetch(`${THAILAND_POST_API_BASE}/track`, {
          method: "POST",
          headers: {
            "Authorization": `Token ${newToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "all",
            language: "TH",
            barcode: [barcode.trim().toUpperCase()],
          }),
        });
        
        const retryText = await retryResponse.text();
        if (!retryResponse.ok) {
          throw new Error(`Track API error after retry: ${retryResponse.status}`);
        }
        
        const retryData = JSON.parse(retryText);
        return parseTrackingResponse(retryData, barcode);
      }
      
      if (response.status === 403) {
        throw new Error("API access forbidden. Please verify your API token.");
      }
      
      if (response.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      }
      
      throw new Error(`Track API error: ${response.status}`);
    }

    const data = JSON.parse(responseText);
    return parseTrackingResponse(data, barcode);
    
  } catch (error) {
    if (error.message?.includes("fetch failed")) {
      logger.error("Network error:", error);
      throw new Error("Unable to connect to Thailand Post API. Please check your internet connection.");
    }
    
    logger.error("Error tracking EMS:", { barcode, error: error.message });
    throw error;
  }
}

/**
 * Parse tracking response from API
 */
function parseTrackingResponse(data, barcode) {
  if (!data || !data.response || !data.response.items) {
    throw new Error("Invalid response from Thailand Post API");
  }

  const items = data.response.items[barcode.trim().toUpperCase()];

  if (!items || items.length === 0) {
    throw new Error("No tracking information found for this barcode");
  }

  return {
    barcode: barcode.trim().toUpperCase(),
    items: items,
    productName: items[0]?.product_name || "EMS",
    trackCount: data.response?.track_count,
  };
}

/**
 * Validate EMS barcode format
 * @param {string} barcode - EMS tracking number
 * @returns {boolean} True if valid EMS barcode
 */
export function isValidEMSBarcode(barcode) {
  if (!barcode || typeof barcode !== "string") {
    return false;
  }
  
  const emsPattern = /^[A-Z]{2}\d{9}[A-Z]{2}$/i;
  return emsPattern.test(barcode.trim());
}

/**
 * Get status description in English
 * @param {string} statusCode - Delivery status code
 * @returns {string} Status description
 */
export function getStatusDescription(statusCode) {
  const descriptions = {
    "101": "Preparing for Shipment",
    "102": "Received via Agent",
    "103": "Received",
    "104": "Sender Requested Withdrawal/Cancellation",
    "201": "Departed from Post Office",
    "202": "Customs Processing",
    "203": "Returned to Origin",
    "204": "Arrived at International Outbound Exchange",
    "205": "Arrived at International Inbound Exchange",
    "206": "Arrived at Post Office",
    "208": "Dispatched from Outbound Exchange",
    "209": "Export Cancelled",
    "210": "Import Cancelled",
    "211": "Received at Sorting Center",
    "212": "Handed to Airline",
    "213": "Airline Received",
    "214": "Data Sent to Destination Country",
    "215": "Import Approved at Destination Country",
    "216": "Arrived at Airport",
    "217": "In Transit at Intermediate Country",
    "218": "Arrived at Destination Airline Warehouse",
    "219": "Airline Delivered to Destination Post",
    "220": "Arrived at Post Office/Postal Center",
    "301": "Out for Delivery",
    "302": "Delivered at Collection Point",
    "303": "Officer Contacting Recipient",
    "304": "Officer Unable to Contact Recipient",
    "401": "Delivery Unsuccessful",
    "402": "Notice Posted at Receiving Post Office",
    "501": "Delivered Successfully",
    "901": "Payment Transferred to Seller",
  };

  return descriptions[statusCode] || "Unknown Status";
}
