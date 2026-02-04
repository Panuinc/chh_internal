import { NextResponse } from "next/server";
import { bcClient } from "@/lib/bc/server";
import { createLogger } from "@/lib/shared/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const cache = {
  dimensions: { data: null, timestamp: 0 },
  dimensionValues: { data: null, timestamp: 0 },
  ttl: 5 * 60 * 1000,
};

async function getDimensionId(dimensionCode) {
  const log = createLogger("GetDimensionId");
  const now = Date.now();

  if (cache.dimensions.data && now - cache.dimensions.timestamp < cache.ttl) {
    const cached = cache.dimensions.data.find(
      (d) => d.code?.toUpperCase() === dimensionCode.toUpperCase(),
    );
    if (cached) return cached.id;
  }

  try {
    const result = await bcClient.get("/dimensions");
    let dimensions = [];

    if (Array.isArray(result)) {
      dimensions = result;
    } else if (result?.value) {
      dimensions = result.value;
    }

    cache.dimensions.data = dimensions;
    cache.dimensions.timestamp = now;

    const dimension = dimensions.find(
      (d) => d.code?.toUpperCase() === dimensionCode.toUpperCase(),
    );

    if (dimension) {
      log.success({ dimensionCode, dimensionId: dimension.id });
      return dimension.id;
    }

    log.error({ message: `Dimension '${dimensionCode}' not found` });
    return null;
  } catch (err) {
    log.error({ message: err.message });
    return null;
  }
}

export async function GET(request) {
  const log = createLogger("GetDimensionValues");

  try {
    const { searchParams } = new URL(request.url);
    const codes = searchParams.get("codes");
    const dimensionCode = searchParams.get("dimensionCode") || "PROJECT";

    if (!codes) {
      return NextResponse.json(
        { success: false, error: "codes parameter is required" },
        { status: 400 },
      );
    }

    const codeList = codes
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    if (codeList.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid codes provided" },
        { status: 400 },
      );
    }

    log.start({ codesCount: codeList.length, dimensionCode });

    const dimensionId = await getDimensionId(dimensionCode);

    if (!dimensionId) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          total: 0,
          dimensionCode,
          requestedCodes: codeList.length,
          error: `Dimension '${dimensionCode}' not found`,
        },
      });
    }

    let allDimensionValues = [];
    const now = Date.now();

    if (
      cache.dimensionValues.data &&
      now - cache.dimensionValues.timestamp < cache.ttl
    ) {
      log.success({ source: "cache" });
      allDimensionValues = cache.dimensionValues.data;
    } else {
      try {
        const result = await bcClient.get("/dimensionValues");

        if (Array.isArray(result)) {
          allDimensionValues = result;
        } else if (result?.value) {
          allDimensionValues = result.value;
        }

        cache.dimensionValues.data = allDimensionValues;
        cache.dimensionValues.timestamp = now;

        log.success({ source: "api", total: allDimensionValues.length });
      } catch (err) {
        log.error({ message: err.message });
        return NextResponse.json({
          success: true,
          data: [],
          meta: {
            total: 0,
            dimensionCode,
            requestedCodes: codeList.length,
            error: err.message,
          },
        });
      }
    }

    const filteredByDimension = allDimensionValues.filter(
      (dim) => dim.dimensionId === dimensionId,
    );

    const filteredValues = filteredByDimension.filter((dim) =>
      codeList.includes(dim.code),
    );

    const normalizedValues = filteredValues.map((dim) => ({
      code: dim.code,
      displayName: dim.displayName || dim.code,
      dimensionCode: dimensionCode,
      dimensionId: dim.dimensionId,
    }));

    log.success({
      found: normalizedValues.length,
      requested: codeList.length,
      totalInDimension: filteredByDimension.length,
    });

    return NextResponse.json({
      success: true,
      data: normalizedValues,
      meta: {
        total: normalizedValues.length,
        dimensionCode,
        dimensionId,
        requestedCodes: codeList.length,
        totalInDimension: filteredByDimension.length,
      },
    });
  } catch (error) {
    log.error({ message: error.message });

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch dimension values",
      },
      { status: 500 },
    );
  }
}
