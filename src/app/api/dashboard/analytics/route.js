import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { bcClient, ENDPOINTS, query } from "@/lib/bc/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function fetchBCItemCounts() {
  try {
    const [fgItems, rmItems, spItems, pkItems] = await Promise.all([
      bcClient.get(
        query()
          .filter("inventoryPostingGroupCode", "eq", "FG")
          .select("id", "inventory")
          .buildPath(ENDPOINTS.ITEMS),
      ),
      bcClient.get(
        query()
          .filter("inventoryPostingGroupCode", "eq", "RM")
          .select("id", "inventory")
          .buildPath(ENDPOINTS.ITEMS),
      ),
      bcClient.get(
        query()
          .filter("inventoryPostingGroupCode", "eq", "SP")
          .select("id", "inventory")
          .buildPath(ENDPOINTS.ITEMS),
      ),
      bcClient.get(
        query()
          .filter("inventoryPostingGroupCode", "eq", "PK")
          .select("id", "inventory")
          .buildPath(ENDPOINTS.ITEMS),
      ),
    ]);

    const count = (arr) => (Array.isArray(arr) ? arr.length : 0);
    const inStock = (arr) =>
      Array.isArray(arr) ? arr.filter((i) => i.inventory > 0).length : 0;

    const fgCount = count(fgItems);
    const rmCount = count(rmItems);
    const spCount = count(spItems);
    const pkCount = count(pkItems);

    return {
      warehouse: {
        totalItems: fgCount + rmCount + spCount + pkCount,
        totalInStock:
          inStock(fgItems) +
          inStock(rmItems) +
          inStock(spItems) +
          inStock(pkItems),
        finishedGoods: fgCount,
        rawMaterials: rmCount,
        supplies: spCount,
        packing: pkCount,
      },
      production: {
        totalProducts: fgCount,
        inStock: inStock(fgItems),
        outOfStock: fgCount - inStock(fgItems),
      },
    };
  } catch {
    return {
      warehouse: {
        totalItems: 0,
        totalInStock: 0,
        finishedGoods: 0,
        rawMaterials: 0,
        supplies: 0,
        packing: 0,
      },
      production: { totalProducts: 0, inStock: 0, outOfStock: 0 },
    };
  }
}

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

    const [
      totalEmployees,
      activeEmployees,
      totalDepartments,
      totalRoles,
      totalVisitors,
      checkedIn,
      visitorsToday,
      totalPatrols,
      totalMemos,
      pendingSalesManager,
      pendingCeo,
      approvedMemos,
      totalEMS,
      emsReceived,
      employeesByDepartment,
      monthlyMemosRaw,
      bcData,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { employeeStatus: "Active" } }),
      prisma.department.count({ where: { departmentStatus: "Active" } }),
      prisma.role.count({ where: { roleStatus: "Active" } }),
      prisma.visitor.count(),
      prisma.visitor.count({ where: { visitorStatus: "CheckIn" } }),
      prisma.visitor.count({
        where: { visitorCreatedAt: { gte: startOfToday, lt: endOfToday } },
      }),
      prisma.patrol.count(),
      prisma.salesMemo.count(),
      prisma.salesMemo.count({
        where: { memoStatus: "PENDING_SALES_MANAGER" },
      }),
      prisma.salesMemo.count({ where: { memoStatus: "PENDING_CEO" } }),
      prisma.salesMemo.count({ where: { memoStatus: "APPROVED" } }),
      prisma.eMSTracking.count(),
      prisma.eMSTracking.count({ where: { emsStatus: "CALLED_RECEIVED" } }),
      prisma.department.findMany({
        where: { departmentStatus: "Active" },
        select: {
          departmentName: true,
          _count: { select: { employees: true } },
        },
        orderBy: { employees: { _count: "desc" } },
      }),
      prisma.salesMemo.findMany({
        select: { memoCreatedAt: true },
        orderBy: { memoCreatedAt: "asc" },
      }),
      fetchBCItemCounts(),
    ]);

    const monthlyMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyMap[key] = { name: monthNames[d.getMonth()], count: 0 };
    }
    monthlyMemosRaw.forEach((memo) => {
      const d = new Date(memo.memoCreatedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthlyMap[key]) monthlyMap[key].count++;
    });

    const pendingMemos = pendingSalesManager + pendingCeo;
    const emsSuccessRate =
      totalEMS > 0 ? Math.round((emsReceived / totalEMS) * 100) : 0;

    return NextResponse.json({
      status: "success",
      data: {
        hr: {
          totalEmployees,
          activeEmployees,
          totalDepartments,
          totalRoles,
        },
        security: {
          totalVisitors,
          checkedIn,
          visitorsToday,
          totalPatrols,
        },
        sales: {
          totalMemos,
          pendingMemos,
          approvedMemos,
        },
        accounting: {
          totalEMS,
          emsReceived,
          emsSuccessRate,
        },
        warehouse: bcData.warehouse,
        production: bcData.production,
        charts: {
          employeesByDepartment: employeesByDepartment.map((d) => ({
            name: d.departmentName,
            count: d._count.employees,
          })),
          monthlyMemos: Object.values(monthlyMap),
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: error.message },
      { status: 500 },
    );
  }
}
