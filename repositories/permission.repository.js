import prisma from "@/lib/prisma";

/**
 * Permission Repository
 * จัดการ Database Operations สำหรับ Permission
 * Layer นี้รับผิดชอบเฉพาะการ query database เท่านั้น
 */
export class PermissionRepository {
  /**
   * Include options for relations
   */
  static includeWithRelations = {
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
  };

  static includeBasic = {
    createdByEmp: {
      select: {
        empFirstName: true,
        empLastName: true,
      },
    },
    _count: {
      select: { empPerms: true },
    },
  };

  /**
   * ดึง permissions ทั้งหมด
   * @param {Object} options - Query options
   * @param {string|null} options.status - Filter by status
   * @param {string} options.orderBy - Order by field
   * @param {string} options.order - Sort direction (asc/desc)
   */
  static async findAll(options = {}) {
    const { status = "Active", orderBy = "permName", order = "asc" } = options;

    return await prisma.perm.findMany({
      where: status ? { permStatus: status } : undefined,
      orderBy: { [orderBy]: order },
      include: this.includeWithRelations,
    });
  }

  /**
   * ค้นหา permission ด้วย ID
   * @param {string} permId
   */
  static async findById(permId) {
    return await prisma.perm.findUnique({
      where: { permId },
      include: this.includeBasic,
    });
  }

  /**
   * ค้นหา permission ด้วยชื่อ
   * @param {string} permName
   */
  static async findByName(permName) {
    return await prisma.perm.findUnique({
      where: { permName },
    });
  }

  /**
   * ค้นหา permissions หลายรายการด้วย IDs
   * @param {string[]} permIds
   */
  static async findByIds(permIds) {
    return await prisma.perm.findMany({
      where: {
        permId: { in: permIds },
      },
      include: this.includeBasic,
    });
  }

  /**
   * ค้นหา permissions ด้วย pattern (LIKE)
   * @param {string} pattern
   */
  static async findByPattern(pattern) {
    return await prisma.perm.findMany({
      where: {
        permName: {
          contains: pattern,
        },
      },
      include: this.includeBasic,
    });
  }

  /**
   * สร้าง permission ใหม่
   * @param {Object} data
   * @param {string} data.permName
   * @param {string} [data.permStatus]
   * @param {string} data.createdBy
   */
  static async create(data) {
    return await prisma.perm.create({
      data: {
        permName: data.permName,
        permStatus: data.permStatus || "Active",
        permCreatedBy: data.createdBy,
        permCreatedAt: new Date(),
      },
    });
  }

  /**
   * อัพเดท permission
   * @param {string} permId
   * @param {Object} data
   */
  static async update(permId, data) {
    const updateData = {
      permUpdatedAt: new Date(),
    };

    if (data.permName !== undefined) {
      updateData.permName = data.permName;
    }
    if (data.permStatus !== undefined) {
      updateData.permStatus = data.permStatus;
    }
    if (data.updatedBy !== undefined) {
      updateData.permUpdatedBy = data.updatedBy;
    }

    return await prisma.perm.update({
      where: { permId },
      data: updateData,
    });
  }

  /**
   * Soft delete - เปลี่ยน status เป็น Inactive
   * @param {string} permId
   * @param {string} updatedBy
   */
  static async softDelete(permId, updatedBy) {
    return await prisma.perm.update({
      where: { permId },
      data: {
        permStatus: "Inactive",
        permUpdatedBy: updatedBy,
        permUpdatedAt: new Date(),
      },
    });
  }

  /**
   * Hard delete - ลบจริงจาก database
   * @param {string} permId
   */
  static async hardDelete(permId) {
    // Transaction: ลบ empPerms ก่อน แล้วค่อยลบ permission
    return await prisma.$transaction(async (tx) => {
      await tx.empPerm.deleteMany({
        where: { empPermPermId: permId },
      });

      return await tx.perm.delete({
        where: { permId },
      });
    });
  }

  /**
   * นับจำนวน permission
   * @param {string|null} status
   */
  static async count(status = null) {
    return await prisma.perm.count({
      where: status ? { permStatus: status } : undefined,
    });
  }

  /**
   * ตรวจสอบว่า permission มีการใช้งานอยู่หรือไม่
   * @param {string} permId
   */
  static async hasAssignments(permId) {
    const count = await prisma.empPerm.count({
      where: { empPermPermId: permId },
    });
    return count > 0;
  }

  /**
   * Batch create permissions
   * @param {Array} permissions
   */
  static async createMany(permissions) {
    return await prisma.perm.createMany({
      data: permissions.map((p) => ({
        permName: p.permName,
        permStatus: p.permStatus || "Active",
        permCreatedBy: p.createdBy,
        permCreatedAt: new Date(),
      })),
      skipDuplicates: true,
    });
  }
}

export default PermissionRepository;