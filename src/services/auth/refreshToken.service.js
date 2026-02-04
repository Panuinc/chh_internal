import prisma from "@/lib/prisma";
import { getLocalNow } from "@/lib/getLocalNow";
import { createLogger } from "@/lib/shared/logger";

const logger = createLogger("RefreshTokenService");

const REFRESH_TOKEN_CONFIG = {
  EXPIRES_IN: 30 * 24 * 60 * 60,

  TOKEN_LENGTH: 64,
};

async function generateRandomToken(length = 64) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export async function createRefreshToken(accountId, metadata = {}) {
  logger.start({ accountId });

  try {
    const token = await generateRandomToken(REFRESH_TOKEN_CONFIG.TOKEN_LENGTH);

    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_CONFIG.EXPIRES_IN * 1000,
    );

    await prisma.refreshToken.create({
      data: {
        token,
        accountId,
        expiresAt,
        ipAddress: metadata.ipAddress || null,
        userAgent: metadata.userAgent || null,
      },
    });

    logger.success({ accountId, expiresAt });

    return {
      token,
      expiresAt,
    };
  } catch (error) {
    logger.error({ accountId, error: error.message });
    throw error;
  }
}

export async function verifyRefreshToken(token) {
  logger.start({ token: token?.substring(0, 10) + "..." });

  try {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        account: {
          include: {
            accountEmployee: {
              include: {
                assigns: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!refreshToken) {
      logger.warn("Token not found");
      return null;
    }

    if (refreshToken.revokedAt) {
      logger.warn("Token has been revoked");
      return null;
    }

    if (new Date() > refreshToken.expiresAt) {
      logger.warn("Token has expired");
      return null;
    }

    const account = refreshToken.account;
    if (account.accountStatus !== "Active") {
      logger.warn("Account is inactive");
      return null;
    }

    if (account.accountEmployee.employeeStatus !== "Active") {
      logger.warn("Employee is inactive");
      return null;
    }

    logger.success({ accountId: account.accountId });

    return account;
  } catch (error) {
    logger.error({ error: error.message });
    throw error;
  }
}

export async function revokeRefreshToken(token) {
  logger.start({ token: token?.substring(0, 10) + "..." });

  try {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: {
        revokedAt: getLocalNow(),
      },
    });

    logger.success({ token: token?.substring(0, 10) + "..." });
  } catch (error) {
    logger.error({ error: error.message });
    throw error;
  }
}

export async function revokeAllUserTokens(accountId) {
  logger.start({ accountId });

  try {
    await prisma.refreshToken.updateMany({
      where: {
        accountId,
        revokedAt: null,
      },
      data: {
        revokedAt: getLocalNow(),
      },
    });

    logger.success({ accountId });
  } catch (error) {
    logger.error({ accountId, error: error.message });
    throw error;
  }
}

export async function cleanupExpiredTokens() {
  logger.start({});

  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: getLocalNow(),
        },
      },
    });

    logger.success({ deletedCount: result.count });
    return result.count;
  } catch (error) {
    logger.error({ error: error.message });
    throw error;
  }
}

export async function rotateRefreshToken(oldToken, metadata = {}) {
  logger.start({ oldToken: oldToken?.substring(0, 10) + "..." });

  try {
    const account = await verifyRefreshToken(oldToken);
    if (!account) {
      throw new Error("Invalid refresh token");
    }

    await revokeRefreshToken(oldToken);

    const newTokenData = await createRefreshToken(account.accountId, metadata);

    logger.success({
      accountId: account.accountId,
      newToken: newTokenData.token?.substring(0, 10) + "...",
    });

    return newTokenData;
  } catch (error) {
    logger.error({ error: error.message });
    throw error;
  }
}

export default {
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanupExpiredTokens,
  rotateRefreshToken,
  REFRESH_TOKEN_CONFIG,
};
