import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const startOfWeek = new Date(startOfToday);
    const day = startOfWeek.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(startOfWeek.getDate() + diff);

    const [
      visitorsToday,
      checkedInToday,
      totalVisitors,
      patrolsToday,
      totalPatrols,
      dailyVisitorsRaw,
    ] = await Promise.all([
      prisma.visitor.count({
        where: { visitorCreatedAt: { gte: startOfToday, lt: endOfToday } },
      }),
      prisma.visitor.count({
        where: { visitorStatus: "CheckIn" },
      }),
      prisma.visitor.count(),
      prisma.patrol.count({
        where: { patrolCreatedAt: { gte: startOfToday, lt: endOfToday } },
      }),
      prisma.patrol.count(),
      prisma.visitor.groupBy({
        by: ["visitorCreatedAt"],
        where: { visitorCreatedAt: { gte: startOfWeek } },
        _count: true,
      }),
    ]);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      dailyMap[dayNames[d.getDay()]] = 0;
    }

    dailyVisitorsRaw.forEach((entry) => {
      const d = new Date(entry.visitorCreatedAt);
      const dayName = dayNames[d.getDay()];
      if (dailyMap[dayName] !== undefined) {
        dailyMap[dayName] += entry._count;
      }
    });

    const dailyVisitors = Object.entries(dailyMap).map(([name, visitors]) => ({
      name,
      visitors,
    }));

    const checkedOutToday =
      visitorsToday - checkedInToday > 0 ? visitorsToday - checkedInToday : 0;

    return NextResponse.json({
      status: "success",
      data: {
        visitorsToday,
        checkedIn: checkedInToday,
        checkedOut: checkedOutToday,
        patrolsToday,
        totalVisitors,
        totalPatrols,
        dailyVisitors,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: error.message },
      { status: 500 },
    );
  }
}
