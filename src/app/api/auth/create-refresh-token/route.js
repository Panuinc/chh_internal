/**
 * Create Refresh Token API
 * สร้าง Refresh Token หลังจาก Login สำเร็จ
 * ใช้แทนการสร้างใน authorize callback เพื่อหลีกเลี่ยง Edge Runtime issue
 */

import { NextResponse } from "next/server";
import { createRefreshToken } from "@/services/auth/refreshToken.service";
import { createLogger } from "@/lib/shared/logger";
import { withRateLimit } from "@/lib/rateLimiter";

const logger = createLogger("CreateRefreshTokenAPI");

async function handler(request) {
  logger.start({});

  try {
    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    const metadata = {
      ipAddress: request.headers.get("x-forwarded-for") || request.ip,
      userAgent: request.headers.get("user-agent"),
    };

    const refreshTokenData = await createRefreshToken(accountId, metadata);

    logger.success({ accountId });

    return NextResponse.json({
      refreshToken: refreshTokenData.token,
      refreshTokenExpires: refreshTokenData.expiresAt.toISOString(),
    });
  } catch (error) {
    logger.error({ error: error.message });
    return NextResponse.json(
      { error: "Failed to create refresh token" },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handler, { type: 'strict' });

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
