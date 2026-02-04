/**
 * Refresh Token Service
 * จัดการการสร้าง ตรวจสอบ และยกเลิก Refresh Token
 * 
 * ใช้ Web Crypto API แทน Node.js crypto เพื่อรองรับ Edge Runtime
 */

import prisma from "@/lib/prisma";
import { getLocalNow } from "@/lib/getLocalNow";
import { createLogger } from "@/lib/shared/logger";

const logger = createLogger("RefreshTokenService");

// ค่าคงที่สำหรับ Refresh Token
const REFRESH_TOKEN_CONFIG = {
  // อายุ 30 วัน (วินาที)
  EXPIRES_IN: 30 * 24 * 60 * 60,
  // ความยาว token (bytes)
  TOKEN_LENGTH: 64,
};

/**
 * สร้าง Random Token โดยใช้ Web Crypto API
 * รองรับทั้ง Node.js และ Edge Runtime
 */
async function generateRandomToken(length = 64) {
  // ใช้ Web Crypto API (รองรับทั้ง Browser, Node.js, Edge Runtime)
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * สร้าง Refresh Token ใหม่
 * @param {string} accountId - ID ของบัญชี
 * @param {Object} metadata - ข้อมูลเพิ่มเติม (ipAddress, userAgent)
 * @returns {Promise<{token: string, expiresAt: Date}>}
 */
export async function createRefreshToken(accountId, metadata = {}) {
  logger.start({ accountId });

  try {
    // สร้าง token แบบสุ่มโดยใช้ Web Crypto API
    const token = await generateRandomToken(REFRESH_TOKEN_CONFIG.TOKEN_LENGTH);

    // คำนวณเวลาหมดอายุ
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_CONFIG.EXPIRES_IN * 1000
    );

    // บันทึกลงฐานข้อมูล
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

/**
 * ตรวจสอบและใช้ Refresh Token
 * @param {string} token - Refresh Token
 * @returns {Promise<Object|null>} - ข้อมูล account หรือ null ถ้าไม่ valid
 */
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

    // ตรวจสอบว่ามี token หรือไม่
    if (!refreshToken) {
      logger.warn("Token not found");
      return null;
    }

    // ตรวจสอบว่าถูก revoked หรือไม่
    if (refreshToken.revokedAt) {
      logger.warn("Token has been revoked");
      return null;
    }

    // ตรวจสอบว่าหมดอายุหรือไม่
    if (new Date() > refreshToken.expiresAt) {
      logger.warn("Token has expired");
      return null;
    }

    // ตรวจสอบว่า account ยัง active อยู่หรือไม่
    const account = refreshToken.account;
    if (account.accountStatus !== "Active") {
      logger.warn("Account is inactive");
      return null;
    }

    // ตรวจสอบว่า employee ยัง active อยู่หรือไม่
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

/**
 * ยกเลิก Refresh Token (Revoke)
 * @param {string} token - Refresh Token
 */
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

/**
 * ยกเลิก Refresh Token ทั้งหมดของ account
 * @param {string} accountId - ID ของบัญชี
 */
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

/**
 * ลบ Refresh Token ที่หมดอายุแล้ว (Cleanup)
 * ควรเรียกใช้เป็น Cron Job
 */
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

/**
 * หมุนเวียน Refresh Token (Rotation)
 * สร้าง token ใหม่ และ revoke token เก่า
 * @param {string} oldToken - Refresh Token เก่า
 * @param {Object} metadata - ข้อมูลเพิ่มเติม
 * @returns {Promise<{token: string, expiresAt: Date}>}
 */
export async function rotateRefreshToken(oldToken, metadata = {}) {
  logger.start({ oldToken: oldToken?.substring(0, 10) + "..." });

  try {
    // ตรวจสอบ token เก่า
    const account = await verifyRefreshToken(oldToken);
    if (!account) {
      throw new Error("Invalid refresh token");
    }

    // Revoke token เก่า
    await revokeRefreshToken(oldToken);

    // สร้าง token ใหม่
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
