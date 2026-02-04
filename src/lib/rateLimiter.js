import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";
import { NextResponse } from "next/server";
import { RATE_LIMITS, MESSAGES } from "@/config/app.config";

const limiters = new Map();

function createLimiter(type = "general") {
  const config = RATE_LIMITS[type.toUpperCase()] || RATE_LIMITS.API_GENERAL;

  return new RateLimiterMemory({
    keyPrefix: `rl_${type}`,
    points: config.points,
    duration: config.duration,
    blockDuration: config.blockDuration || config.duration,
  });
}

function getLimiter(type) {
  if (!limiters.has(type)) {
    limiters.set(type, createLimiter(type));
  }
  return limiters.get(type);
}

function getClientIP(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }

  return "127.0.0.1";
}

export async function checkRateLimit(request, type = "general") {
  const limiter = getLimiter(type);
  const ip = getClientIP(request);
  const key = `${ip}:${type}`;

  try {
    const limiterRes = await limiter.consume(key);
    return {
      success: true,
      remaining: limiterRes.remainingPoints,
      limiterRes,
    };
  } catch (rejRes) {
    if (rejRes instanceof RateLimiterRes) {
      return {
        success: false,
        limiterRes: rejRes,
        retryAfter: Math.round(rejRes.msBeforeNext / 1000),
      };
    }
    throw rejRes;
  }
}

export function withRateLimit(handler, options = {}) {
  const { type = "general", skipSuccessfulRequests = false } = options;

  return async function (request, ...args) {
    const result = await checkRateLimit(request, type);

    if (!result.success) {
      return NextResponse.json(
        {
          error: MESSAGES.ERROR.RATE_LIMIT,
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.retryAfter),
            "X-RateLimit-Limit": String(
              RATE_LIMITS[type.toUpperCase()]?.points ||
                RATE_LIMITS.API_GENERAL.points,
            ),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(
              Math.ceil(Date.now() / 1000) + (result.retryAfter || 60),
            ),
          },
        },
      );
    }

    const response = await handler(request, ...args);

    if (response && response.headers) {
      response.headers.set(
        "X-RateLimit-Limit",
        String(
          RATE_LIMITS[type.toUpperCase()]?.points ||
            RATE_LIMITS.API_GENERAL.points,
        ),
      );
      response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    }

    return response;
  };
}

export async function checkAuthRateLimit(request) {
  return checkRateLimit(request, "auth_login");
}

export async function checkUploadRateLimit(request) {
  return checkRateLimit(request, "upload");
}

export async function resetRateLimit(ip, type = "general") {
  const limiter = getLimiter(type);
  const key = `${ip}:${type}`;
  await limiter.delete(key);
}

export default {
  checkRateLimit,
  withRateLimit,
  checkAuthRateLimit,
  checkUploadRateLimit,
  resetRateLimit,
  getClientIP,
};
