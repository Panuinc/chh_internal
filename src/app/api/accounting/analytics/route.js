import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const [
      totalRecords,
      notCalled,
      calledNotReceived,
      calledReceived,
      cannotContact,
      monthlyRaw,
    ] = await Promise.all([
      prisma.eMSTracking.count(),
      prisma.eMSTracking.count({ where: { emsStatus: "NOT_CALLED" } }),
      prisma.eMSTracking.count({ where: { emsStatus: "CALLED_NOT_RECEIVED" } }),
      prisma.eMSTracking.count({ where: { emsStatus: "CALLED_RECEIVED" } }),
      prisma.eMSTracking.count({ where: { emsStatus: "CANNOT_CONTACT" } }),
      prisma.eMSTracking.findMany({
        select: { emsCreatedAt: true },
        orderBy: { emsCreatedAt: "asc" },
      }),
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyMap = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyMap[key] = { name: monthNames[d.getMonth()], count: 0 };
    }

    monthlyRaw.forEach((record) => {
      const d = new Date(record.emsCreatedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthlyMap[key]) {
        monthlyMap[key].count++;
      }
    });

    const monthlyTracking = Object.values(monthlyMap);
    const successRate =
      totalRecords > 0 ? Math.round((calledReceived / totalRecords) * 100) : 0;

    return NextResponse.json({
      status: "success",
      data: {
        totalRecords,
        notCalled,
        calledNotReceived,
        calledReceived,
        cannotContact,
        successRate,
        monthlyTracking,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: error.message },
      { status: 500 },
    );
  }
}
