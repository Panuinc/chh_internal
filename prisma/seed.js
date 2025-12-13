import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultPermissions = [
  // Core permissions
  { name: "superAdmin", description: "Super Admin - Full access" },
  
  // HR Module
  { name: "hr.view", description: "View HR module" },
  { name: "hr.*", description: "Full HR access" },
  
  // HR - Employee
  { name: "hr.employee.view", description: "View employees" },
  { name: "hr.employee.create", description: "Create employees" },
  { name: "hr.employee.edit", description: "Edit employees" },
  { name: "hr.employee.delete", description: "Delete employees" },
  
  // HR - Department
  { name: "hr.department.view", description: "View departments" },
  { name: "hr.department.create", description: "Create departments" },
  { name: "hr.department.edit", description: "Edit departments" },
  { name: "hr.department.delete", description: "Delete departments" },
  
  // HR - Permission Management (superAdmin only typically)
  { name: "hr.permission.view", description: "View permissions" },
  { name: "hr.assignPermission.view", description: "View assign permission page" },
];

async function main() {
  console.log("🌱 Starting seed...");

  // สร้าง default permissions
  for (const perm of defaultPermissions) {
    const existing = await prisma.perm.findUnique({
      where: { permName: perm.name },
    });

    if (!existing) {
      await prisma.perm.create({
        data: {
          permName: perm.name,
          permStatus: "Active",
          permCreatedAt: new Date(),
        },
      });
      console.log(`✅ Created permission: ${perm.name}`);
    } else {
      console.log(`⏭️  Permission exists: ${perm.name}`);
    }
  }

  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
