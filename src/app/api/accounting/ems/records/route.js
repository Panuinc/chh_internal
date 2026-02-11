import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger.node";

const logger = createLogger("EMSRecordsAPI");

/**
 * GET /api/accounting/ems/records
 * Fetch all EMS records
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where = {};
    
    if (status && status !== "ALL") {
      where.emsStatus = status;
    }
    
    if (search) {
      where.OR = [
        { emsBarcode: { contains: search, mode: "insensitive" } },
        { emsCustomerName: { contains: search, mode: "insensitive" } },
      ];
    }

    const records = await prisma.eMSTracking.findMany({
      where,
      orderBy: { emsCreatedAt: "desc" },
      include: {
        createdByEmployee: {
          select: {
            employeeFirstName: true,
            employeeLastName: true,
          },
        },
        updatedByEmployee: {
          select: {
            employeeFirstName: true,
            employeeLastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: records,
    });
  } catch (error) {
    const errorMessage = error?.message || JSON.stringify(error) || "Unknown error";
    logger.error("Error fetching EMS records:", { error: errorMessage, stack: error?.stack });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounting/ems/records
 * Create a new EMS record
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { barcode, customerName, status, notes, lastTracking } = body;

    if (!barcode) {
      return NextResponse.json(
        { success: false, error: "Barcode is required" },
        { status: 400 }
      );
    }

    // Validate EMS barcode format
    const emsPattern = /^[A-Z]{2}\d{9}[A-Z]{2}$/i;
    if (!emsPattern.test(barcode.trim())) {
      return NextResponse.json(
        { success: false, error: "Invalid EMS barcode format" },
        { status: 400 }
      );
    }

    // Check if barcode already exists
    const existing = await prisma.eMSTracking.findUnique({
      where: { emsBarcode: barcode.trim().toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "EMS barcode already exists" },
        { status: 409 }
      );
    }

    const record = await prisma.eMSTracking.create({
      data: {
        emsBarcode: barcode.trim().toUpperCase(),
        emsCustomerName: customerName || null,
        emsStatus: status || "NOT_CALLED",
        emsNotes: notes || null,
        emsLastTracking: lastTracking || null,
        emsCreatedBy: session.user.id,
      },
      include: {
        createdByEmployee: {
          select: {
            employeeFirstName: true,
            employeeLastName: true,
          },
        },
      },
    });

    logger.info("EMS record created", { 
      emsId: record.emsId, 
      barcode: record.emsBarcode,
      createdBy: session.user.id 
    });

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    logger.error("Error creating EMS record:", { error: error.message });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
