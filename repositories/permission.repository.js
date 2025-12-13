import prisma from "@/lib/prisma";

/**
 * Permission Repository
 * จัดการ Database Operations สำหรับ Permission
 */
export const PermissionRepository = {
  /**
   * ดึง permissions ทั้งหมด
   */
  async findAll(options = {}) {
    const { status = "Active", orderBy = "permName", order = "asc" } = options;

    return await prisma.perm.findMany({
      where: status ? { permStatus: status } : undefined,
      orderBy: { [orderBy]: order },
      include: {
        createdByEmp: {
          select: {
            empFirstName: true,
            empLastName: true,
          },
        },
        updatedByEmp: {
          select: {
            empFirstName: true,
            empLastName: true,
          },
        },
        _count: {
          select: { empPerms: true },
        },
      },
    });
  },

  /**
   * ค้นหา permission ด้วย ID
   */
  async findById(permId) {
    return await prisma.perm.findUnique({
      where: { permId },
      include: {
        createdByEmp: {
          select: {
            empFirstName: true,
            empLastName: true,
          },
        },
        _count: {
          select: { empPerms: true },
        },
      },
    });
  },

  /**
   * ค้นหา permission ด้วยชื่อ
   */
  async findByName(permName) {
    return await prisma.perm.findUnique({
      where: { permName },
    });
  },

  /**
   * สร้าง permission ใหม่
   */
  async create(data) {
    return await prisma.perm.create({
      data: {
        permName: data.permName,
        permStatus: data.permStatus || "Active",
        permCreatedBy: data.createdBy,
        permCreatedAt: new Date(),
      },
    });
  },

  /**
   * อัพเดท permission
   */
  async update(permId, data) {
    return await prisma.perm.update({
      where: { permId },
      data: {
        permName: data.permName,
        permStatus: data.permStatus,
        permUpdatedBy: data.updatedBy,
        permUpdatedAt: new Date(),
      },
    });
  },

  /**
   * ลบ permission (Soft delete - เปลี่ยน status)
   */
  async softDelete(permId, updatedBy) {
    return await prisma.perm.update({
      where: { permId },
      data: {
        permStatus: "Inactive",
        permUpdatedBy: updatedBy,
        permUpdatedAt: new Date(),
      },
    });
  },

  /**
   * ลบ permission จริง (Hard delete)
   */
  async delete(permId) {
    // ลบ empPerms ที่เกี่ยวข้องก่อน
    await prisma.empPerm.deleteMany({
      where: { empPermPermId: permId },
    });

    return await prisma.perm.delete({
      where: { permId },
    });
  },

  /**
   * นับจำนวน permission ทั้งหมด
   */
  async count(status) {
    return await prisma.perm.count({
      where: status ? { permStatus: status } : undefined,
    });
  },
};

export default PermissionRepository;
