import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { bcConfig } from "@/lib/bc/config";
import { PRINTER_CONFIG } from "@/lib/chainWay/config";
import { withRateLimit } from "@/lib/rateLimiter";

async function checkDatabase() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: "healthy",
      responseTime: `${Date.now() - start}ms`,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      responseTime: `${Date.now() - start}ms`,
    };
  }
}

async function checkBusinessCentral() {
  const start = Date.now();
  try {
    const { bcClient } = await import("@/lib/bc/server");

    await bcClient.getToken();
    return {
      status: "healthy",
      responseTime: `${Date.now() - start}ms`,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      responseTime: `${Date.now() - start}ms`,
    };
  }
}

async function checkPrinter() {
  const start = Date.now();
  try {
    const net = await import("net");

    return new Promise((resolve) => {
      const socket = new net.Socket();

      socket.setTimeout(5000);

      socket.on("connect", () => {
        socket.destroy();
        resolve({
          status: "healthy",
          responseTime: `${Date.now() - start}ms`,
        });
      });

      socket.on("timeout", () => {
        socket.destroy();
        resolve({
          status: "unhealthy",
          error: "Connection timeout",
          responseTime: `${Date.now() - start}ms`,
        });
      });

      socket.on("error", (error) => {
        resolve({
          status: "unhealthy",
          error: error.message,
          responseTime: `${Date.now() - start}ms`,
        });
      });

      socket.connect(PRINTER_CONFIG.port, PRINTER_CONFIG.host);
    });
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      responseTime: `${Date.now() - start}ms`,
    };
  }
}

function checkEnvironment() {
  const required = ["DATABASE_URL", "AUTH_SECRET", "NEXT_PUBLIC_BASE_URL"];

  const missing = required.filter((key) => !process.env[key]);

  return {
    status: missing.length === 0 ? "healthy" : "unhealthy",
    missing: missing.length > 0 ? missing : undefined,
  };
}

function getSystemInfo() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    uptime: `${Math.floor(process.uptime() / 60)} minutes`,
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
    },
    timestamp: new Date().toISOString(),
  };
}

async function handler(request) {
  const start = Date.now();

  const [database, businessCentral, printer, environment] = await Promise.all([
    checkDatabase(),
    checkBusinessCentral(),
    checkPrinter(),
    checkEnvironment(),
  ]);

  const allHealthy =
    database.status === "healthy" &&
    businessCentral.status === "healthy" &&
    environment.status === "healthy";

  const response = {
    status: allHealthy ? "healthy" : "degraded",
    checks: {
      database,
      businessCentral,
      printer,
      environment,
    },
    info: getSystemInfo(),
    responseTime: `${Date.now() - start}ms`,
  };

  return NextResponse.json(response, {
    status: allHealthy ? 200 : 503,
  });
}

export async function HEAD(request) {
  return new NextResponse(null, { status: 200 });
}

export const GET = withRateLimit(handler, { type: "general" });

export const dynamic = "force-dynamic";
