import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger.node";

const logger = createLogger("EMSRecordAPI");

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { customerName, status, notes, callDate, lastTracking } = body;

    const existing = await prisma.eMSTracking.findUnique({
      where: { emsId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "EMS record not found" },
        { status: 404 },
      );
    }

    const updateData = {
      emsUpdatedBy: session.user.id,
      emsUpdatedAt: new Date(),
    };

    if (customerName !== undefined) {
      updateData.emsCustomerName = customerName || null;
    }

    if (status !== undefined) {
      updateData.emsStatus = status;
    }

    if (notes !== undefined) {
      updateData.emsNotes = notes || null;
    }

    if (callDate !== undefined) {
      updateData.emsCallDate = callDate ? new Date(callDate) : null;
    }

    if (lastTracking !== undefined) {
      updateData.emsLastTracking = lastTracking || null;
    }

    const record = await prisma.eMSTracking.update({
      where: { emsId: id },
      data: updateData,
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

    logger.info("EMS record updated", {
      emsId: record.emsId,
      barcode: record.emsBarcode,
      updatedBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    const errorMessage =
      error?.message || JSON.stringify(error) || "Unknown error";
    logger.error("Error updating EMS record:", {
      error: errorMessage,
      stack: error?.stack,
    });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const existing = await prisma.eMSTracking.findUnique({
      where: { emsId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "EMS record not found" },
        { status: 404 },
      );
    }

    await prisma.eMSTracking.delete({
      where: { emsId: id },
    });

    logger.info("EMS record deleted", {
      emsId: id,
      barcode: existing.emsBarcode,
      deletedBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      message: "EMS record deleted successfully",
    });
  } catch (error) {
    const errorMessage =
      error?.message || JSON.stringify(error) || "Unknown error";
    logger.error("Error deleting EMS record:", {
      error: errorMessage,
      stack: error?.stack,
    });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await params;

    const record = await prisma.eMSTracking.findUnique({
      where: { emsId: id },
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

    if (!record) {
      return NextResponse.json(
        { success: false, error: "EMS record not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (error) {
    const errorMessage =
      error?.message || JSON.stringify(error) || "Unknown error";
    logger.error("Error fetching EMS record:", {
      error: errorMessage,
      stack: error?.stack,
    });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
