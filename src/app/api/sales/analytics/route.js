import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const [
      totalMemos,
      draftMemos,
      pendingSalesManager,
      pendingCeo,
      approvedMemos,
      rejectedMemos,
      monthlyMemosRaw,
    ] = await Promise.all([
      prisma.salesMemo.count(),
      prisma.salesMemo.count({ where: { memoStatus: "DRAFT" } }),
      prisma.salesMemo.count({ where: { memoStatus: "PENDING_SALES_MANAGER" } }),
      prisma.salesMemo.count({ where: { memoStatus: "PENDING_CEO" } }),
      prisma.salesMemo.count({ where: { memoStatus: "APPROVED" } }),
      prisma.salesMemo.count({ where: { memoStatus: "REJECTED" } }),
      prisma.salesMemo.findMany({
        select: { memoCreatedAt: true },
        orderBy: { memoCreatedAt: "asc" },
      }),
    ]);

    // Aggregate by month (last 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMap = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyMap[key] = { name: monthNames[d.getMonth()], count: 0 };
    }

    monthlyMemosRaw.forEach((memo) => {
      const d = new Date(memo.memoCreatedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthlyMap[key]) {
        monthlyMap[key].count++;
      }
    });

    const monthlyMemos = Object.values(monthlyMap);
    const pendingMemos = pendingSalesManager + pendingCeo;

    return NextResponse.json({
      status: "success",
      data: {
        totalMemos,
        draftMemos,
        pendingMemos,
        pendingSalesManager,
        pendingCeo,
        approvedMemos,
        rejectedMemos,
        monthlyMemos,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: error.message },
      { status: 500 }
    );
  }
}
