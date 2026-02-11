import jwt from "jsonwebtoken";
import { bcConfig } from "./config.js";
import { BCAuthError, BCApiError } from "./errors.js";
import { createLogger } from "@/lib/logger.node";

const logger = createLogger("bc-client");

const tokenCache = {
  token: null,
  expiresAt: null,
};

const responseCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

const NO_CACHE_PATHS = ["/salesOrders", "/customers"];

const MAX_PAGES = 10;
const MAX_TOTAL_ITEMS = 5000;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];
const FETCH_TIMEOUT_MS = 30000; 

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(url, options, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

class BCClient {
  constructor() {
    this.config = bcConfig;
  }

  async getAccessToken() {
    const { token, expiresAt } = tokenCache;
    const bufferMs = this.config.options.tokenBufferMs;

    if (token && expiresAt && Date.now() < expiresAt - bufferMs) {
      this.log("Using cached token");
      return token;
    }

    this.log("Requesting new access token");

    const params = new URLSearchParams({
      // eslint-disable-next-line camelcase
      grant_type: "client_credentials",
      // eslint-disable-next-line camelcase
      client_id: this.config.auth.clientId,
      // eslint-disable-next-line camelcase
      client_secret: this.config.auth.clientSecret,
      scope: this.config.auth.scope,
    });

    try {
      const response = await fetch(this.config.auth.url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new BCAuthError(`Token request failed: ${errorText}`, {
          status: response.status,
        });
      }

      const data = await response.json();
      tokenCache.token = data.access_token;

      const decoded = jwt.decode(data.access_token);
      tokenCache.expiresAt = decoded?.exp
        ? decoded.exp * 1000
        : Date.now() + 3600000;

      this.log("Access token obtained successfully");
      return tokenCache.token;
    } catch (error) {
      if (error instanceof BCAuthError) throw error;
      throw new BCAuthError(`Authentication failed: ${error.message}`);
    }
  }

  clearTokenCache() {
    tokenCache.token = null;
    tokenCache.expiresAt = null;
    this.log("Token cache cleared");
  }

  _getCacheKey(path) {
    return path;
  }

  _shouldCache(path) {
    return !NO_CACHE_PATHS.some((noCache) => path.includes(noCache));
  }

  _getCachedResponse(path) {
    const key = this._getCacheKey(path);
    const cached = responseCache.get(key);

    if (!cached) return null;

    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      responseCache.delete(key);
      return null;
    }

    this.log(`Cache hit: ${path}`);
    return cached.data;
  }

  _setCachedResponse(path, data) {
    if (!this._shouldCache(path)) return;

    const key = this._getCacheKey(path);
    responseCache.set(key, {
      data,
      timestamp: Date.now(),
    });
    this.log(`Cached response: ${path}`);
  }

  clearResponseCache() {
    responseCache.clear();
    this.log("Response cache cleared");
  }

  buildUrl(path) {
    if (path.startsWith("http")) return path;

    const { baseUrl, tenantId, environment, company } = this.config.api;

    if (path.startsWith("/ODataV4")) {
      return `${baseUrl}/${tenantId}/${environment}/ODataV4/Company('${company}')${path.replace(
        "/ODataV4",
        "",
      )}`;
    }

    return `${baseUrl}/${tenantId}/${environment}/api/v2.0/companies(${company})${path}`;
  }

  buildHeaders(token, customHeaders = {}) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json;odata.metadata=minimal",
      Prefer: `odata.maxpagesize=${this.config.options.defaultPageSize}`,
      ...customHeaders,
    };
  }

  async executeFetch(url, options, headers, retryCount = 0) {
    try {
      const response = await fetchWithTimeout(
        url,
        { ...options, headers },
        FETCH_TIMEOUT_MS,
      );

      if (response.status === 401 && retryCount === 0) {
        this.log("Received 401, refreshing token");
        this.clearTokenCache();
        const newToken = await this.getAccessToken();
        const newHeaders = this.buildHeaders(newToken, options.headers);
        return fetchWithTimeout(
          url,
          { ...options, headers: newHeaders },
          FETCH_TIMEOUT_MS,
        );
      }

      if (
        RETRY_STATUS_CODES.includes(response.status) &&
        retryCount < MAX_RETRIES
      ) {
        const waitTime = RETRY_DELAY_MS * Math.pow(2, retryCount); // Exponential backoff
        this.log(
          `Received ${response.status}, retrying in ${waitTime}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`,
        );
        await delay(waitTime);
        return this.executeFetch(url, options, headers, retryCount + 1);
      }

      return response;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new BCApiError(
          `Request timeout after ${FETCH_TIMEOUT_MS}ms`,
          408,
          "TIMEOUT",
        );
      }

      if (retryCount < MAX_RETRIES) {
        const waitTime = RETRY_DELAY_MS * Math.pow(2, retryCount);
        this.log(
          `Network error: ${error.message}, retrying in ${waitTime}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`,
        );
        await delay(waitTime);
        return this.executeFetch(url, options, headers, retryCount + 1);
      }
      throw error;
    }
  }

  async fetch(path, options = {}) {
    const token = await this.getAccessToken();
    const headers = this.buildHeaders(token, options.headers);
    const url = this.buildUrl(path);

    this.log(`Request: ${options.method || "GET"} ${url}`);

    let allResults = [];
    let nextUrl = url;
    let pageCount = 0;

    while (nextUrl) {
      pageCount++;

      if (pageCount > MAX_PAGES) {
        this.log(`Reached max page limit (${MAX_PAGES}), stopping pagination`);
        break;
      }

      if (allResults.length >= MAX_TOTAL_ITEMS) {
        this.log(
          `Reached max items limit (${MAX_TOTAL_ITEMS}), stopping pagination`,
        );
        break;
      }

      this.log(`Fetching page ${pageCount}: ${nextUrl}`);

      const response = await this.executeFetch(nextUrl, options, headers);

      if (!response.ok) {
        const errorText = await response.text();
        throw new BCApiError(
          `BC API Error: ${response.status} - ${errorText}`,
          response.status,
          errorText,
        );
      }

      const data = await response.json();

      if (Array.isArray(data.value)) {
        allResults.push(...data.value);

        if (allResults.length >= MAX_TOTAL_ITEMS) {
          this.log(`Reached max items limit after adding page ${pageCount}`);
          break;
        }

        nextUrl = data["@odata.nextLink"] || null;
      } else {
        this.log(`Response received (single object)`);
        return data;
      }
    }

    this.log(
      `Response received (${allResults.length} items, ${pageCount} pages)`,
    );
    return allResults;
  }

  async get(path, options = {}) {
    if (!options.skipCache) {
      const cached = this._getCachedResponse(path);
      if (cached) return cached;
    }

    const result = await this.fetch(path, { ...options, method: "GET" });

    this._setCachedResponse(path, result);

    return result;
  }

  async post(path, body, options = {}) {
    return this.fetch(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async patch(path, body, options = {}) {
    return this.fetch(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async delete(path, options = {}) {
    return this.fetch(path, { ...options, method: "DELETE" });
  }

  log(message) {
    if (this.config.options.debug) {
      logger.debug({ message });
    }
  }
}

export const bcClient = new BCClient();
export { BCClient };
