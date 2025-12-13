import PermissionUseCases from "@/usecases/permission.usecase";

/**
 * Permission Service
 * Facade Layer - รวม Use Cases ให้เรียกใช้ง่ายขึ้น
 * Service นี้ทำหน้าที่เป็น entry point สำหรับ business logic
 */
export class PermissionService {
  /**
   * ดึง permissions ทั้งหมด
   * @param {Object} options - Query options
   */
  static async getAllPermissions(options = {}) {
    return await PermissionUseCases.getAllPermissions.execute(options);
  }

  /**
   * ดึง permission ด้วย ID
   * @param {string} permId
   */
  static async getPermissionById(permId) {
    return await PermissionUseCases.getPermissionById.execute(permId);
  }

  /**
   * สร้าง permission ใหม่
   * @param {Object} data
   * @param {string} data.permName
   * @param {string} data.createdBy
   */
  static async createPermission(data) {
    return await PermissionUseCases.createPermission.execute(data);
  }

  /**
   * อัพเดท permission
   * @param {string} permId
   * @param {Object} data
   */
  static async updatePermission(permId, data) {
    return await PermissionUseCases.updatePermission.execute(permId, data);
  }

  /**
   * ลบ permission (soft delete)
   * @param {string} permId
   * @param {string} userId
   */
  static async deletePermission(permId, userId) {
    return await PermissionUseCases.deletePermission.execute(permId, userId);
  }

  /**
   * ดึงสถิติ permissions
   */
  static async getStatistics() {
    return await PermissionUseCases.getStatistics.execute();
  }

  /**
   * ตรวจสอบว่า permission มีอยู่หรือไม่
   * @param {string} permName
   */
  static async checkPermissionExists(permName) {
    return await PermissionUseCases.checkExists.execute(permName);
  }

  /**
   * Validate permission name format
   * Static utility method
   */
  static isValidPermissionName(name) {
    const pattern = /^[a-zA-Z]+(\.[a-zA-Z*]+)*$/;
    return pattern.test(name);
  }
}

export default PermissionService;