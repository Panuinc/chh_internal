import jwt from "jsonwebtoken";
import { bcConfig } from "./config.js";
import { BCAuthError, BCApiError } from "./errors.js";

const tokenCache = {
  token: null,
  expiresAt: null,
};

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
      grant_type: "client_credentials",
      client_id: this.config.auth.clientId,
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

  buildUrl(path) {
    if (path.startsWith("http")) return path;

    const { baseUrl, tenantId, environment, company } = this.config.api;

    if (path.startsWith("/ODataV4")) {
      return `${baseUrl}/${tenantId}/${environment}/ODataV4/Company('${company}')${path.replace(
        "/ODataV4",
        ""
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

  async executeFetch(url, options, headers) {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      this.log("Received 401, refreshing token");
      this.clearTokenCache();
      const newToken = await this.getAccessToken();
      const newHeaders = this.buildHeaders(newToken, options.headers);
      return fetch(url, { ...options, headers: newHeaders });
    }

    return response;
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
      this.log(`Fetching page ${pageCount}: ${nextUrl}`);

      const response = await this.executeFetch(nextUrl, options, headers);

      if (!response.ok) {
        const errorText = await response.text();
        throw new BCApiError(
          `BC API Error: ${response.status} - ${errorText}`,
          response.status,
          errorText
        );
      }

      const data = await response.json();

      if (Array.isArray(data.value)) {
        allResults.push(...data.value);
        nextUrl = data["@odata.nextLink"] || null;
      } else {
        this.log(`Response received (single object)`);
        return data;
      }
    }

    this.log(`Response received (${allResults.length} items)`);
    return allResults;
  }

  async get(path, options = {}) {
    return this.fetch(path, { ...options, method: "GET" });
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
      console.log(`[BC Client] ${new Date().toISOString()} - ${message}`);
    }
  }
}

export const bcClient = new BCClient();
export { BCClient };
