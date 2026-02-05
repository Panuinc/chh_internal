import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultPermissions = [
  { name: "superadmin", description: "Super Admin - Full access" },

  { name: "hr.view", description: "View HR module" },
  { name: "hr.*", description: "Full HR access" },

  { name: "hr.employee.view", description: "View employees" },
  { name: "hr.employee.create", description: "Create employees" },
  { name: "hr.employee.edit", description: "Edit employees" },

  { name: "hr.department.view", description: "View departments" },
  { name: "hr.department.create", description: "Create departments" },
  { name: "hr.department.edit", description: "Edit departments" },

  // Sales Module Permissions
  { name: "sales.view", description: "View sales module" },
  { name: "sales.*", description: "Full sales access" },
  
  // Sales Memo Permissions
  { name: "sales.memo.view", description: "View sales memos" },
  { name: "sales.memo.create", description: "Create sales memos" },
  { name: "sales.memo.edit", description: "Edit sales memos" },
  { name: "sales.memo.approve.salesmanager", description: "Approve memos as Sales Manager" },
  { name: "sales.memo.approve.ceo", description: "Approve memos as CEO" },
  
  // Sales Order Online Permissions
  { name: "sales.salesOrderOnline.view", description: "View sales order online" },
  { name: "sales.salesOrderOnline.create", description: "Create sales order online" },
  { name: "sales.salesOrderOnline.edit", description: "Edit sales order online" },
];

async function main() {
  console.log("🌱 Starting seed...");

  for (const perm of defaultPermissions) {
    const existing = await prisma.permission.findUnique({
      where: { permissionName: perm.name },
    });

    if (!existing) {
      await prisma.permission.create({
        data: {
          permissionName: perm.name,
          permissionStatus: "Active",
          permissionCreatedAt: new Date(),
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
