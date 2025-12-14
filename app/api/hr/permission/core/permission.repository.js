import prisma from "@/lib/prisma";

export const PermissionRepository = {
  getAll: async (skip = 0, take = 10) => {
    return prisma.permission.findMany({
      skip,
      take,
      orderBy: { permissionCreatedAt: "asc" },
      include: {
        createdByEmployee: {
          select: { employeeId: true, employeeFirstName: true, employeeLastName: true },
        },
        updatedByEmployee: {
          select: { employeeId: true, employeeFirstName: true, employeeLastName: true },
        },
      },
    });
  },

  countAll: async () => {
    return prisma.permission.count();
  },

  findById: async (permissionId) => {
    return prisma.permission.findUnique({
      where: { permissionId },
      include: {
        createdByEmployee: {
          select: { employeeId: true, employeeFirstName: true, employeeLastName: true },
        },
        updatedByEmployee: {
          select: { employeeId: true, employeeFirstName: true, employeeLastName: true },
        },
      },
    });
  },

  findByPermissionName: async (permissionName) => {
    return prisma.permission.findUnique({
      where: { permissionName },
    });
  },

  create: async (data) => {
    return prisma.permission.create({
      data,
      include: {
        createdByEmployee: {
          select: { employeeId: true, employeeFirstName: true, employeeLastName: true },
        },
      },
    });
  },

  update: async (permissionId, data) => {
    return prisma.permission.update({
      where: { permissionId },
      data,
      include: {
        updatedByEmployee: {
          select: { employeeId: true, employeeFirstName: true, employeeLastName: true },
        },
      },
    });
  },
};