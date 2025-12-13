import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import PermissionService from "@/services/permission.service";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { permId } = await params;

    const permission = await PermissionService.getPermissionById(permId);

    return NextResponse.json({
      success: true,
      data: permission,
    });
  } catch (error) {
    console.error("Error fetching permission:", error);

    if (error.message === "Permission not found") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch permission" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { permId } = await params;
    const body = await request.json();

    const permission = await PermissionService.updatePermission(permId, {
      permName: body.permName,
      permStatus: body.permStatus,
      updatedBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: permission,
      message: "Permission updated successfully",
    });
  } catch (error) {
    console.error("Error updating permission:", error);

    if (error.message === "Permission not found") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    if (error.message === "Permission name already exists") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to update permission" },
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { permId } = await params;

    const result = await PermissionService.deletePermission(
      permId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error deleting permission:", error);

    if (error.message === "Permission not found") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    if (error.message === "Cannot delete superAdmin permission") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete permission" },
      { status: 500 }
    );
  }
}
