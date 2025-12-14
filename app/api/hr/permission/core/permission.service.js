import { PermissionRepository } from "@/app/api/hr/permission/core/permission.repository";

export class PermissionService {
  static async getAllPaginated(skip, take) {
    return PermissionRepository.getAll(skip, take);
  }

  static async countAll() {
    return PermissionRepository.countAll();
  }

  static async getById(permissionId) {
    return PermissionRepository.findById(permissionId);
  }

  static async getByPermissionName(permissionName) {
    return PermissionRepository.findByPermissionName(permissionName);
  }

  static async create(data) {
    if (!data) {
      throw {
        status: 500,
        message: "PermissionService.create called without data",
      };
    }

    const permissionData = {
      ...data,
    };

    return PermissionRepository.create(permissionData);
  }

  static async update(permissionId, data) {
    if (!data) {
      throw {
        status: 500,
        message: "PermissionService.update called without data",
      };
    }

    return PermissionRepository.update(permissionId, data);
  }
}
