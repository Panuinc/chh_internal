/**
 * Rate Limiting Utility
 * ใช้สำหรับจำกัดจำนวน Request ป้องกัน Brute-force และ DDoS
 */

import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { NextResponse } from 'next/server';
import { RATE_LIMITS, MESSAGES } from '@/config/app.config';

// Store limiters in memory (in production, use Redis)
const limiters = new Map();

/**
 * สร้าง Rate Limiter ตามประเภท
 */
function createLimiter(type = 'general') {
  const config = RATE_LIMITS[type.toUpperCase()] || RATE_LIMITS.API_GENERAL;
  
  return new RateLimiterMemory({
    keyPrefix: `rl_${type}`,
    points: config.points,
    duration: config.duration,
    blockDuration: config.blockDuration || config.duration,
  });
}

/**
 * ดึง Limiters (สร้างใหม่ถ้ายังไม่มี)
 */
function getLimiter(type) {
  if (!limiters.has(type)) {
    limiters.set(type, createLimiter(type));
  }
  return limiters.get(type);
}

/**
 * ดึง Client IP จาก Request
 */
function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  
  // สำหรับ development
  return '127.0.0.1';
}

/**
 * Check Rate Limit
 * @param {Request} request - Next.js Request object
 * @param {string} type - ประเภทของ limiter (general, strict, auth_login, upload)
 * @returns {Promise<{success: boolean, limiterRes?: RateLimiterRes, remaining?: number}>}
 */
export async function checkRateLimit(request, type = 'general') {
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

/**
 * Middleware wrapper สำหรับใช้กับ API Routes
 * @param {Function} handler - API handler
 * @param {Object} options - { type: string, skipSuccessfulRequests: boolean }
 */
export function withRateLimit(handler, options = {}) {
  const { type = 'general', skipSuccessfulRequests = false } = options;
  
  return async function(request, ...args) {
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
            'Retry-After': String(result.retryAfter),
            'X-RateLimit-Limit': String(RATE_LIMITS[type.toUpperCase()]?.points || RATE_LIMITS.API_GENERAL.points),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + (result.retryAfter || 60)),
          },
        }
      );
    }
    
    // Add rate limit headers to successful response
    const response = await handler(request, ...args);
    
    if (response && response.headers) {
      response.headers.set('X-RateLimit-Limit', String(RATE_LIMITS[type.toUpperCase()]?.points || RATE_LIMITS.API_GENERAL.points));
      response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    }
    
    return response;
  };
}

/**
 * ตรวจสอบ Rate Limit สำหรับ Auth Routes (เข้มงวดกว่า)
 */
export async function checkAuthRateLimit(request) {
  return checkRateLimit(request, 'auth_login');
}

/**
 * ตรวจสอบ Rate Limit สำหรับ Upload Routes
 */
export async function checkUploadRateLimit(request) {
  return checkRateLimit(request, 'upload');
}

/**
 * Reset Rate Limit สำหรับ IP ที่ระบุ (ใช้สำหรับ admin)
 */
export async function resetRateLimit(ip, type = 'general') {
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
