import { NextResponse } from "next/server";
import {
  verifyRefreshToken,
  rotateRefreshToken,
} from "@/services/auth/refreshToken.service";
import { sign } from "jsonwebtoken";
import { createLogger } from "@/lib/logger.node";
import { withRateLimit } from "@/lib/rateLimiter";

const logger = createLogger("RefreshTokenAPI");

const ACCESS_TOKEN_EXPIRES = 15 * 60;

async function handler(request) {
  logger.start({});

  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 },
      );
    }

    const metadata = {
      ipAddress: request.headers.get("x-forwarded-for") || request.ip,
      userAgent: request.headers.get("user-agent"),
    };

    const account = await verifyRefreshToken(refreshToken);
    if (!account) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 },
      );
    }

    const newRefreshToken = await rotateRefreshToken(refreshToken, metadata);

    const permissions = account.accountEmployee.assigns
      .filter((a) => a.permission.permissionStatus === "Active")
      .map((a) => a.permission.permissionName);

    const accessToken = sign(
      {
        id: account.accountEmployee.employeeId,
        accountId: account.accountId,
        username: account.accountUsername,
        email: account.accountEmployee.employeeEmail,
        name: `${account.accountEmployee.employeeFirstName} ${account.accountEmployee.employeeLastName}`,
        firstName: account.accountEmployee.employeeFirstName,
        lastName: account.accountEmployee.employeeLastName,
        permissions,
        isSuperAdmin: permissions.includes("superadmin"),
      },
      process.env.AUTH_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES },
    );

    logger.success({ accountId: account.accountId });

    return NextResponse.json({
      accessToken,
      refreshToken: newRefreshToken.token,
      expiresIn: ACCESS_TOKEN_EXPIRES,
      tokenType: "Bearer",
    });
  } catch (error) {
    logger.error({ error: error.message });
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(handler, { type: "strict" });

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
