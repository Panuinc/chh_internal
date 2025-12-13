import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import PermissionService from "@/services/permission.service";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "Active";
    const orderBy = searchParams.get("orderBy") || "permName";
    const order = searchParams.get("order") || "asc";

    const permissions = await PermissionService.getAllPermissions({
      status: status === "all" ? null : status,
      orderBy,
      order,
    });

    return NextResponse.json({
      success: true,
      data: permissions,
      count: permissions.length,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    const permission = await PermissionService.createPermission({
      permName: body.permName,
      createdBy: session.user.id,
    });

    return NextResponse.json(
      {
        success: true,
        data: permission,
        message: "Permission created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating permission:", error);

    if (
      error.message === "Permission already exists" ||
      error.message === "Permission name is required"
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to create permission" },
      { status: 500 }
    );
  }
}
