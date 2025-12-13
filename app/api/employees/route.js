import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employees = await prisma.emp.findMany({
      where: { empStatus: "Active" },
      orderBy: { empFirstName: "asc" },
      include: {
        empAcc: {
          select: {
            empAccUsername: true,
            empAccStatus: true,
          },
        },
        empPerms: {
          include: {
            perm: {
              select: {
                permId: true,
                permName: true,
                permStatus: true,
              },
            },
          },
        },
      },
    });

    const formattedEmployees = employees.map((emp) => ({
      empId: emp.empId,
      empFirstName: emp.empFirstName,
      empLastName: emp.empLastName,
      empEmail: emp.empEmail,
      empStatus: emp.empStatus,
      username: emp.empAcc?.empAccUsername || null,
      accountStatus: emp.empAcc?.empAccStatus || null,
      permissions: emp.empPerms
        .filter((ep) => ep.perm.permStatus === "Active")
        .map((ep) => ({
          empPermId: ep.empPermId,
          permId: ep.perm.permId,
          permName: ep.perm.permName,
        })),
      isSuperAdmin: emp.empPerms.some(
        (ep) => ep.perm.permName === "superAdmin" && ep.perm.permStatus === "Active"
      ),
    }));

    return NextResponse.json(formattedEmployees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}
