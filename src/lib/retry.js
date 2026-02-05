import { createLogger } from "@/lib/logger.node";

const logger = createLogger("retry");

export const DEFAULT_RETRY_OPTIONS = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  maxRetryDelay: 10000,
  retryableErrors: [],
  onRetry: null,
};

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function calculateDelay(attempt, options) {
  const { retryDelay, backoffMultiplier, maxRetryDelay } = options;
  const calculatedDelay = retryDelay * Math.pow(backoffMultiplier, attempt - 1);
  return Math.min(calculatedDelay, maxRetryDelay);
}

export function isRetryableError(error, retryableErrors) {
  if (!error) return false;

  if (error.code === "ECONNRESET" ||
      error.code === "ETIMEDOUT" ||
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND") {
    return true;
  }

  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  if (retryableStatusCodes.includes(error.statusCode)) {
    return true;
  }

  if (retryableErrors.length > 0) {
    return retryableErrors.some((retryableError) =>
      error.message?.includes(retryableError) ||
      error.code === retryableError
    );
  }

  return false;
}

export async function withRetry(fn, options = {}) {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const { maxRetries, onRetry } = config;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const isRetryable = isRetryableError(error, config.retryableErrors);

      if (!isRetryable || attempt === maxRetries) {
        logger.error({
          message: `Failed after ${attempt} attempt(s)`,
          error: error.message,
          retryable: isRetryable,
        });
        throw error;
      }

      const waitTime = calculateDelay(attempt, config);

      logger.warn({
        message: `Retry attempt ${attempt}/${maxRetries}`,
        error: error.message,
        waitTime,
      });

      if (onRetry) {
        onRetry(attempt, error, waitTime);
      }

      await delay(waitTime);
    }
  }

  throw lastError;
}

export function createRetryableFunction(fn, options = {}) {
  return function(...args) {
    return withRetry(() => fn(...args), options);
  };
}
