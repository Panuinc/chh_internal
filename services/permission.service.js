import PermissionRepository from "@/repositories/permission.repository";

/**
 * Permission Service
 * จัดการ Business Logic สำหรับ Permission
 */
export const PermissionService = {
  /**
   * ดึง permissions ทั้งหมด
   */
  async getAllPermissions(options = {}) {
    const permissions = await PermissionRepository.findAll(options);

    // Transform data
    return permissions.map((perm) => ({
      permId: perm.permId,
      permName: perm.permName,
      permStatus: perm.permStatus,
      userCount: perm._count?.empPerms || 0,
      createdBy: perm.createdByEmp
        ? `${perm.createdByEmp.empFirstName} ${perm.createdByEmp.empLastName}`
        : null,
      createdAt: perm.permCreatedAt,
      updatedBy: perm.updatedByEmp
        ? `${perm.updatedByEmp.empFirstName} ${perm.updatedByEmp.empLastName}`
        : null,
      updatedAt: perm.permUpdatedAt,
    }));
  },

  /**
   * ดึง permission ด้วย ID
   */
  async getPermissionById(permId) {
    const perm = await PermissionRepository.findById(permId);

    if (!perm) {
      throw new Error("Permission not found");
    }

    return {
      permId: perm.permId,
      permName: perm.permName,
      permStatus: perm.permStatus,
      userCount: perm._count?.empPerms || 0,
      createdBy: perm.createdByEmp
        ? `${perm.createdByEmp.empFirstName} ${perm.createdByEmp.empLastName}`
        : null,
      createdAt: perm.permCreatedAt,
    };
  },

  /**
   * สร้าง permission ใหม่
   */
  async createPermission(data) {
    // Validation
    if (!data.permName || !data.permName.trim()) {
      throw new Error("Permission name is required");
    }

    const permName = data.permName.trim();

    // Validate format
    if (!this.isValidPermissionName(permName)) {
      throw new Error(
        "Invalid permission name format. Use: module.action or module.submodule.action"
      );
    }

    // Check duplicate
    const existing = await PermissionRepository.findByName(permName);
    if (existing) {
      throw new Error("Permission already exists");
    }

    // Create
    const permission = await PermissionRepository.create({
      permName,
      permStatus: "Active",
      createdBy: data.createdBy,
    });

    return {
      permId: permission.permId,
      permName: permission.permName,
      permStatus: permission.permStatus,
    };
  },

  /**
   * อัพเดท permission
   */
  async updatePermission(permId, data) {
    // Check exists
    const existing = await PermissionRepository.findById(permId);
    if (!existing) {
      throw new Error("Permission not found");
    }

    // Check duplicate name (if changing name)
    if (data.permName && data.permName !== existing.permName) {
      const duplicate = await PermissionRepository.findByName(data.permName);
      if (duplicate) {
        throw new Error("Permission name already exists");
      }
    }

    // Update
    const permission = await PermissionRepository.update(permId, {
      permName: data.permName || existing.permName,
      permStatus: data.permStatus || existing.permStatus,
      updatedBy: data.updatedBy,
    });

    return {
      permId: permission.permId,
      permName: permission.permName,
      permStatus: permission.permStatus,
    };
  },

  /**
   * ลบ permission (Soft delete)
   */
  async deletePermission(permId, updatedBy) {
    // Check exists
    const existing = await PermissionRepository.findById(permId);
    if (!existing) {
      throw new Error("Permission not found");
    }

    // Prevent delete superAdmin
    if (existing.permName === "superAdmin") {
      throw new Error("Cannot delete superAdmin permission");
    }

    await PermissionRepository.softDelete(permId, updatedBy);

    return { message: "Permission deleted successfully" };
  },

  /**
   * Validate permission name format
   */
  isValidPermissionName(name) {
    // Allow: superAdmin, admin, hr.view, hr.employee.view, hr.*
    const pattern = /^[a-zA-Z]+(\.[a-zA-Z*]+)*$/;
    return pattern.test(name);
  },

  /**
   * ดึง permission statistics
   */
  async getStatistics() {
    const [activeCount, inactiveCount, totalCount] = await Promise.all([
      PermissionRepository.count("Active"),
      PermissionRepository.count("Inactive"),
      PermissionRepository.count(),
    ]);

    return {
      total: totalCount,
      active: activeCount,
      inactive: inactiveCount,
    };
  },
};

export default PermissionService;
