import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isSuperAdmin) {
      return NextResponse.json(
        { error: "Only Super Admin can assign permissions" },
        { status: 403 }
      );
    }

    const { empId } = await params;
    const body = await request.json();
    const { permId } = body;

    if (!permId) {
      return NextResponse.json(
        { error: "Permission ID is required" },
        { status: 400 }
      );
    }

    const employee = await prisma.emp.findUnique({
      where: { empId },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const permission = await prisma.perm.findUnique({
      where: { permId },
    });

    if (!permission) {
      return NextResponse.json(
        { error: "Permission not found" },
        { status: 404 }
      );
    }

    const existing = await prisma.empPerm.findFirst({
      where: {
        empPermEmpId: empId,
        empPermPermId: permId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Employee already has this permission" },
        { status: 400 }
      );
    }

    const empPerm = await prisma.empPerm.create({
      data: {
        empPermEmpId: empId,
        empPermPermId: permId,
        empPermCreatedBy: session.user.id,
        empPermCreatedAt: new Date(),
      },
      include: {
        perm: {
          select: {
            permId: true,
            permName: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        empPermId: empPerm.empPermId,
        permId: empPerm.perm.permId,
        permName: empPerm.perm.permName,
        message: "Permission assigned successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error assigning permission:", error);
    return NextResponse.json(
      { error: "Failed to assign permission" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isSuperAdmin) {
      return NextResponse.json(
        { error: "Only Super Admin can remove permissions" },
        { status: 403 }
      );
    }

    const { empId } = await params;
    const { searchParams } = new URL(request.url);
    const empPermId = searchParams.get("empPermId");

    if (!empPermId) {
      return NextResponse.json(
        { error: "empPermId is required" },
        { status: 400 }
      );
    }

    const empPerm = await prisma.empPerm.findFirst({
      where: {
        empPermId,
        empPermEmpId: empId,
      },
    });

    if (!empPerm) {
      return NextResponse.json(
        { error: "Permission assignment not found" },
        { status: 404 }
      );
    }

    await prisma.empPerm.delete({
      where: { empPermId },
    });

    return NextResponse.json({
      message: "Permission removed successfully",
    });
  } catch (error) {
    console.error("Error removing permission:", error);
    return NextResponse.json(
      { error: "Failed to remove permission" },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { empId } = await params;

    const empPerms = await prisma.empPerm.findMany({
      where: { empPermEmpId: empId },
      include: {
        perm: {
          select: {
            permId: true,
            permName: true,
            permStatus: true,
          },
        },
      },
    });

    const permissions = empPerms
      .filter((ep) => ep.perm.permStatus === "Active")
      .map((ep) => ({
        empPermId: ep.empPermId,
        permId: ep.perm.permId,
        permName: ep.perm.permName,
      }));

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Error fetching employee permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
