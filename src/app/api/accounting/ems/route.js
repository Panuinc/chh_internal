import { NextResponse } from "next/server";
import { trackEMS } from "@/features/accounting/services/ems.service";
import { createLogger } from "@/lib/logger.node";
import { checkRateLimit } from "@/lib/rateLimiter";

const logger = createLogger("EMSTrackingAPI");

export async function POST(request) {
  const rateLimitResult = await checkRateLimit(request, "general");
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please try again later.",
        retryAfter: rateLimitResult.retryAfter,
      },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { barcode } = body;

    if (!barcode) {
      return NextResponse.json(
        { success: false, error: "Barcode is required" },
        { status: 400 },
      );
    }

    logger.info("EMS tracking request", { barcode });

    const trackingData = await trackEMS(barcode);

    return NextResponse.json(
      {
        success: true,
        data: trackingData,
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error("EMS tracking API error:", { error: error.message });

    let statusCode = 500;
    if (error.message?.includes("Invalid")) {
      statusCode = 400;
    } else if (error.message?.includes("not found")) {
      statusCode = 404;
    } else if (error.message?.includes("Authentication")) {
      statusCode = 401;
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: statusCode },
    );
  }
}
