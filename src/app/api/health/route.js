/**
 * Health Check API
 * ตรวจสอบสถานะระบบทั้งหมด
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { bcConfig } from '@/lib/bc/config';
import { PRINTER_CONFIG } from '@/lib/chainWay/config';
import { withRateLimit } from '@/lib/rateLimiter';

/**
 * ตรวจสอบการเชื่อมต่อฐานข้อมูล
 */
async function checkDatabase() {
  const start = Date.now();
  try {
    // ทดสอบ query ง่ายๆ
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      responseTime: `${Date.now() - start}ms`,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: `${Date.now() - start}ms`,
    };
  }
}

/**
 * ตรวจสอบการเชื่อมต่อ Business Central
 */
async function checkBusinessCentral() {
  const start = Date.now();
  try {
    const { bcClient } = await import('@/lib/bc/server');
    // ทดสอบดึง token
    await bcClient.getToken();
    return {
      status: 'healthy',
      responseTime: `${Date.now() - start}ms`,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: `${Date.now() - start}ms`,
    };
  }
}

/**
 * ตรวจสอบการเชื่อมต่อ Printer
 */
async function checkPrinter() {
  const start = Date.now();
  try {
    const net = await import('net');
    
    return new Promise((resolve) => {
      const socket = new net.Socket();
      
      socket.setTimeout(5000);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve({
          status: 'healthy',
          responseTime: `${Date.now() - start}ms`,
        });
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          status: 'unhealthy',
          error: 'Connection timeout',
          responseTime: `${Date.now() - start}ms`,
        });
      });
      
      socket.on('error', (error) => {
        resolve({
          status: 'unhealthy',
          error: error.message,
          responseTime: `${Date.now() - start}ms`,
        });
      });
      
      socket.connect(PRINTER_CONFIG.port, PRINTER_CONFIG.host);
    });
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      responseTime: `${Date.now() - start}ms`,
    };
  }
}

/**
 * ตรวจสอบ Environment Variables
 */
function checkEnvironment() {
  const required = [
    'DATABASE_URL',
    'AUTH_SECRET',
    'NEXT_PUBLIC_BASE_URL',
  ];
  
  const missing = required.filter((key) => !process.env[key]);
  
  return {
    status: missing.length === 0 ? 'healthy' : 'unhealthy',
    missing: missing.length > 0 ? missing : undefined,
  };
}

/**
 * ดึงข้อมูลระบบ
 */
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

/**
 * GET /api/health
 * ตรวจสอบสถานะระบบทั้งหมด
 */
async function handler(request) {
  const start = Date.now();
  
  // ตรวจสอบทุก service
  const [database, businessCentral, printer, environment] = await Promise.all([
    checkDatabase(),
    checkBusinessCentral(),
    checkPrinter(),
    checkEnvironment(),
  ]);
  
  const allHealthy = 
    database.status === 'healthy' &&
    businessCentral.status === 'healthy' &&
    environment.status === 'healthy';
  
  const response = {
    status: allHealthy ? 'healthy' : 'degraded',
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

/**
 * GET /api/health/live
 * ตรวจสอบว่า service ยังมีชีวิตอยู่ (ใช้สำหรับ Kubernetes/Docker)
 */
export async function HEAD(request) {
  return new NextResponse(null, { status: 200 });
}

// ใช้ Rate Limiting แบบ general
export const GET = withRateLimit(handler, { type: 'general' });

// ไม่ต้องใช้ dynamic เพราะเราต้องการ cache ได้
export const dynamic = 'force-dynamic';
