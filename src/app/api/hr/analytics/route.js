import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const [
      totalEmployees,
      activeEmployees,
      totalAccounts,
      activeAccounts,
      totalDepartments,
      totalRoles,
      totalPermissions,
      employeesByDepartment,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { employeeStatus: "Active" } }),
      prisma.account.count(),
      prisma.account.count({ where: { accountStatus: "Active" } }),
      prisma.department.count({ where: { departmentStatus: "Active" } }),
      prisma.role.count({ where: { roleStatus: "Active" } }),
      prisma.permission.count({ where: { permissionStatus: "Active" } }),
      prisma.department.findMany({
        where: { departmentStatus: "Active" },
        select: {
          departmentName: true,
          _count: { select: { employees: true } },
        },
        orderBy: { employees: { _count: "desc" } },
      }),
    ]);

    return NextResponse.json({
      status: "success",
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees: totalEmployees - activeEmployees,
        totalAccounts,
        activeAccounts,
        totalDepartments,
        totalRoles,
        totalPermissions,
        employeesByDepartment: employeesByDepartment.map((d) => ({
          name: d.departmentName,
          count: d._count.employees,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: error.message },
      { status: 500 }
    );
  }
}
