import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ==================== CONFIGURATION ====================
const DEFAULT_PASSWORD = "Password123!";

// ==================== PERMISSIONS ====================
const defaultPermissions = [
  { name: "superadmin", description: "Super Admin - Full access" },

  // HR Module
  { name: "hr.view", description: "View HR module" },
  { name: "hr.*", description: "Full HR access" },

  // Employee
  { name: "hr.employee.view", description: "View employees" },
  { name: "hr.employee.create", description: "Create employees" },
  { name: "hr.employee.edit", description: "Edit employees" },
  { name: "hr.employee.role.view", description: "View employee roles" },
  { name: "hr.employee.role.edit", description: "Edit employee roles" },

  // Department
  { name: "hr.department.view", description: "View departments" },
  { name: "hr.department.create", description: "Create departments" },
  { name: "hr.department.edit", description: "Edit departments" },

  // Role
  { name: "hr.role.view", description: "View roles" },
  { name: "hr.role.create", description: "Create roles" },
  { name: "hr.role.edit", description: "Edit roles" },
  { name: "hr.role.permission.view", description: "View role permissions" },
  { name: "hr.role.permission.edit", description: "Edit role permissions" },

  // Permission
  { name: "hr.permission.view", description: "View permissions" },
  { name: "hr.permission.create", description: "Create permissions" },
  { name: "hr.permission.edit", description: "Edit permissions" },

  // Account
  { name: "hr.account.view", description: "View accounts" },
  { name: "hr.account.create", description: "Create accounts" },
  { name: "hr.account.edit", description: "Edit accounts" },

  // Security Module
  { name: "security.view", description: "View security module" },
  { name: "security.visitor.view", description: "View visitors" },
  { name: "security.visitor.create", description: "Create visitors" },
  { name: "security.visitor.edit", description: "Edit visitors" },
  { name: "security.patrol.view", description: "View patrols" },
  { name: "security.patrol.create", description: "Create patrols" },

  // Warehouse Module
  { name: "warehouse.view", description: "View warehouse module" },
  { name: "warehouse.packing.view", description: "View packing" },
  { name: "warehouse.packing.create", description: "Create packing" },
  { name: "warehouse.packing.edit", description: "Edit packing" },
  { name: "warehouse.supply.view", description: "View supply" },
  { name: "warehouse.supply.create", description: "Create supply" },
  { name: "warehouse.supply.edit", description: "Edit supply" },
  { name: "warehouse.finishedGoods.view", description: "View finished goods" },
  { name: "warehouse.finishedGoods.create", description: "Create finished goods" },
  { name: "warehouse.finishedGoods.edit", description: "Edit finished goods" },
  { name: "warehouse.rawMaterial.view", description: "View raw materials" },
  { name: "warehouse.rawMaterial.create", description: "Create raw materials" },
  { name: "warehouse.rawMaterial.edit", description: "Edit raw materials" },

  // Production Module
  { name: "production.view", description: "View production module" },
  { name: "production.doorBom.view", description: "View door BOM" },
  { name: "production.doorBom.create", description: "Create door BOM" },
  { name: "production.doorBom.edit", description: "Edit door BOM" },

  // Sales Module
  { name: "sales.view", description: "View sales module" },
  { name: "sales.*", description: "Full sales access" },
  { name: "sales.memo.view", description: "View sales memos" },
  { name: "sales.memo.create", description: "Create sales memos" },
  { name: "sales.memo.edit", description: "Edit sales memos" },
  { name: "sales.memo.approve", description: "Approve sales memos" },
  { name: "sales.salesOrderOnline.view", description: "View sales order online" },
  { name: "sales.salesOrderOnline.create", description: "Create sales order online" },
  { name: "sales.salesOrderOnline.edit", description: "Edit sales order online" },
];

// ==================== DEPARTMENTS ====================
const defaultDepartments = [
  { name: "Executive", description: "CEO and Executives" },
  { name: "Human Resources", description: "HR Department" },
  { name: "Information Technology", description: "IT Department" },
  { name: "Security", description: "Security Guards and Patrol" },
  { name: "Warehouse", description: "Inventory and Logistics" },
  { name: "Production", description: "Manufacturing and Production" },
  { name: "Sales", description: "Sales and Marketing" },
  { name: "Finance", description: "Accounting and Finance" },
];

// ==================== ROLES with PERMISSIONS ====================
const defaultRoles = [
  {
    name: "Super Admin",
    permissions: ["superadmin"],
  },
  {
    name: "HR Manager",
    permissions: [
      "hr.view",
      "hr.employee.view", "hr.employee.create", "hr.employee.edit",
      "hr.employee.role.view", "hr.employee.role.edit",
      "hr.department.view",
      "hr.role.view",
      "hr.permission.view",
      "hr.account.view", "hr.account.create", "hr.account.edit",
    ],
  },
  {
    name: "HR Staff",
    permissions: [
      "hr.view",
      "hr.employee.view",
      "hr.department.view",
      "hr.role.view",
    ],
  },
  {
    name: "Security Manager",
    permissions: [
      "security.view",
      "security.visitor.view", "security.visitor.create", "security.visitor.edit",
      "security.patrol.view", "security.patrol.create",
    ],
  },
  {
    name: "Security Staff",
    permissions: [
      "security.view",
      "security.visitor.view", "security.visitor.create",
      "security.patrol.view", "security.patrol.create",
    ],
  },
  {
    name: "Warehouse Manager",
    permissions: [
      "warehouse.view",
      "warehouse.packing.view", "warehouse.packing.create", "warehouse.packing.edit",
      "warehouse.supply.view", "warehouse.supply.create", "warehouse.supply.edit",
      "warehouse.finishedGoods.view", "warehouse.finishedGoods.create", "warehouse.finishedGoods.edit",
      "warehouse.rawMaterial.view", "warehouse.rawMaterial.create", "warehouse.rawMaterial.edit",
    ],
  },
  {
    name: "Warehouse Staff",
    permissions: [
      "warehouse.view",
      "warehouse.packing.view", "warehouse.packing.create",
      "warehouse.supply.view",
      "warehouse.finishedGoods.view",
      "warehouse.rawMaterial.view",
    ],
  },
  {
    name: "Production Manager",
    permissions: [
      "production.view",
      "production.doorBom.view", "production.doorBom.create", "production.doorBom.edit",
    ],
  },
  {
    name: "Production Staff",
    permissions: [
      "production.view",
      "production.doorBom.view",
    ],
  },
  {
    name: "Sales Manager",
    permissions: [
      "sales.view",
      "sales.memo.view", "sales.memo.create", "sales.memo.edit", "sales.memo.approve",
      "sales.salesOrderOnline.view", "sales.salesOrderOnline.create", "sales.salesOrderOnline.edit",
    ],
  },
  {
    name: "CEO",
    permissions: [
      "superadmin",
      "sales.memo.approve",
    ],
  },
  {
    name: "Sales Staff",
    permissions: [
      "sales.view",
      "sales.memo.view", "sales.memo.create",
      "sales.salesOrderOnline.view", "sales.salesOrderOnline.create",
    ],
  },

  {
    name: "General User",
    permissions: [
      "hr.view",
      "security.view",
      "warehouse.view",
      "production.view",
      "sales.view",
    ],
  },
];

// ==================== EMPLOYEES with ROLES ====================
const defaultEmployees = [
  {
    firstName: "Super",
    lastName: "Admin",
    email: "superadmin@evergreen.com",
    department: "Executive",
    roles: ["Super Admin"],
    username: "superadmin",
    isAdmin: true,
  },
  {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@evergreen.com",
    department: "Executive",
    roles: ["CEO"],
    username: "john.smith",
    isAdmin: true,
  },
  {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@evergreen.com",
    department: "Human Resources",
    roles: ["HR Manager"],
    username: "sarah.johnson",
    isAdmin: true,
  },
  {
    firstName: "Mike",
    lastName: "Brown",
    email: "mike.brown@evergreen.com",
    department: "Human Resources",
    roles: ["HR Staff"],
    username: "mike.brown",
    isAdmin: true,
  },

  {
    firstName: "Robert",
    lastName: "Taylor",
    email: "robert.taylor@evergreen.com",
    department: "Security",
    roles: ["Security Manager"],
    username: "robert.taylor",
    isAdmin: true,
  },
  {
    firstName: "James",
    lastName: "Anderson",
    email: "james.anderson@evergreen.com",
    department: "Security",
    roles: ["Security Staff"],
    username: "james.anderson",
    isAdmin: true,
  },
  {
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@evergreen.com",
    department: "Warehouse",
    roles: ["Warehouse Manager"],
    username: "emily.davis",
    isAdmin: true,
  },
  {
    firstName: "Chris",
    lastName: "Martinez",
    email: "chris.martinez@evergreen.com",
    department: "Warehouse",
    roles: ["Warehouse Staff"],
    username: "chris.martinez",
    isAdmin: true,
  },
  {
    firstName: "Lisa",
    lastName: "Garcia",
    email: "lisa.garcia@evergreen.com",
    department: "Production",
    roles: ["Production Manager"],
    username: "lisa.garcia",
    isAdmin: true,
  },
  {
    firstName: "Kevin",
    lastName: "Lee",
    email: "kevin.lee@evergreen.com",
    department: "Production",
    roles: ["Production Staff"],
    username: "kevin.lee",
    isAdmin: true,
  },
  {
    firstName: "Amanda",
    lastName: "White",
    email: "amanda.white@evergreen.com",
    department: "Sales",
    roles: ["Sales Manager"],
    username: "amanda.white",
    isAdmin: true,
  },
  {
    firstName: "Daniel",
    lastName: "Thomas",
    email: "daniel.thomas@evergreen.com",
    department: "Sales",
    roles: ["Sales Staff"],
    username: "daniel.thomas",
    isAdmin: true,
  },
  {
    firstName: "Guest",
    lastName: "User",
    email: "guest@evergreen.com",
    department: "Information Technology",
    roles: ["General User"],
    username: "guest",
    isAdmin: false,
  },
];

// ==================== SEED FUNCTIONS ====================

async function seedPermissions() {
  console.log("🔐 Seeding Permissions...");
  const permissionMap = {};

  for (const perm of defaultPermissions) {
    const existing = await prisma.permission.findUnique({
      where: { permissionName: perm.name },
    });

    if (!existing) {
      const created = await prisma.permission.create({
        data: {
          permissionName: perm.name,
          permissionStatus: "Active",
          permissionCreatedAt: new Date(),
        },
      });
      permissionMap[perm.name] = created.permissionId;
      console.log(`  ✅ Created permission: ${perm.name}`);
    } else {
      permissionMap[perm.name] = existing.permissionId;
      console.log(`  ⏭️  Permission exists: ${perm.name}`);
    }
  }

  return permissionMap;
}

async function seedDepartments() {
  console.log("\n🏢 Seeding Departments...");
  const departmentMap = {};

  for (const dept of defaultDepartments) {
    const existing = await prisma.department.findUnique({
      where: { departmentName: dept.name },
    });

    if (!existing) {
      const created = await prisma.department.create({
        data: {
          departmentName: dept.name,
          departmentStatus: "Active",
          departmentCreatedAt: new Date(),
        },
      });
      departmentMap[dept.name] = created.departmentId;
      console.log(`  ✅ Created department: ${dept.name}`);
    } else {
      departmentMap[dept.name] = existing.departmentId;
      console.log(`  ⏭️  Department exists: ${dept.name}`);
    }
  }

  return departmentMap;
}

async function seedRoles(permissionMap) {
  console.log("\n👔 Seeding Roles...");
  const roleMap = {};

  for (const role of defaultRoles) {
    const existing = await prisma.role.findUnique({
      where: { roleName: role.name },
    });

    let roleId;
    if (!existing) {
      const created = await prisma.role.create({
        data: {
          roleName: role.name,
          roleStatus: "Active",
          roleCreatedAt: new Date(),
        },
      });
      roleId = created.roleId;
      roleMap[role.name] = roleId;
      console.log(`  ✅ Created role: ${role.name}`);
    } else {
      roleId = existing.roleId;
      roleMap[role.name] = roleId;
      console.log(`  ⏭️  Role exists: ${role.name}`);
    }

    // Seed RolePermissions
    console.log(`     🔗 Assigning ${role.permissions.length} permissions...`);
    for (const permName of role.permissions) {
      const permissionId = permissionMap[permName];
      if (!permissionId) {
        console.log(`     ⚠️  Permission not found: ${permName}`);
        continue;
      }

      const existingRP = await prisma.rolePermission.findFirst({
        where: {
          rolePermissionRoleId: roleId,
          rolePermissionPermissionId: permissionId,
        },
      });

      if (!existingRP) {
        await prisma.rolePermission.create({
          data: {
            rolePermissionRoleId: roleId,
            rolePermissionPermissionId: permissionId,
            rolePermissionCreatedAt: new Date(),
          },
        });
      }
    }
  }

  return roleMap;
}

async function seedEmployees(departmentMap, roleMap) {
  console.log("\n👥 Seeding Employees...");
  const employeeMap = {};
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // Get Super Admin employee ID for createdBy
  const superAdmin = await prisma.employee.findFirst({
    where: { employeeEmail: "superadmin@evergreen.com" },
  });
  const systemUserId = superAdmin?.employeeId;

  for (const emp of defaultEmployees) {
    const existing = await prisma.employee.findUnique({
      where: { employeeEmail: emp.email },
    });

    let employeeId;
    if (!existing) {
      const departmentId = departmentMap[emp.department];
      
      const created = await prisma.employee.create({
        data: {
          employeeFirstName: emp.firstName,
          employeeLastName: emp.lastName,
          employeeEmail: emp.email,
          employeeStatus: "Active",
          employeeDepartmentId: departmentId,
          employeeCreatedAt: new Date(),
          employeeCreatedBy: systemUserId,
        },
      });
      employeeId = created.employeeId;
      employeeMap[emp.email] = employeeId;
      console.log(`  ✅ Created employee: ${emp.firstName} ${emp.lastName} (${emp.email})`);
    } else {
      employeeId = existing.employeeId;
      employeeMap[emp.email] = employeeId;
      console.log(`  ⏭️  Employee exists: ${emp.firstName} ${emp.lastName}`);
    }

    // Seed EmployeeRoles
    console.log(`     🔗 Assigning ${emp.roles.length} roles...`);
    for (const roleName of emp.roles) {
      const roleId = roleMap[roleName];
      if (!roleId) {
        console.log(`     ⚠️  Role not found: ${roleName}`);
        continue;
      }

      const existingER = await prisma.employeeRole.findFirst({
        where: {
          employeeRoleEmployeeId: employeeId,
          employeeRoleRoleId: roleId,
        },
      });

      if (!existingER) {
        await prisma.employeeRole.create({
          data: {
            employeeRoleEmployeeId: employeeId,
            employeeRoleRoleId: roleId,
            employeeRoleCreatedAt: new Date(),
            employeeRoleCreatedBy: systemUserId,
          },
        });
      }
    }

    // Seed Account if needed
    if (emp.isAdmin) {
      const existingAccount = await prisma.account.findFirst({
        where: { accountEmployeeId: employeeId },
      });

      if (!existingAccount) {
        await prisma.account.create({
          data: {
            accountEmployeeId: employeeId,
            accountUsername: emp.username,
            accountPassword: hashedPassword,
            accountStatus: "Active",
            accountCreatedAt: new Date(),
            accountCreatedBy: systemUserId,
          },
        });
        console.log(`     🔑 Created account: ${emp.username} / ${DEFAULT_PASSWORD}`);
      } else {
        console.log(`     🔑 Account exists: ${emp.username}`);
      }
    }
  }

  return employeeMap;
}

async function updateSuperAdminCreator(employeeMap) {
  console.log("\n🔄 Updating Super Admin creator...");
  
  const superAdmin = await prisma.employee.findFirst({
    where: { employeeEmail: "superadmin@evergreen.com" },
  });

  if (superAdmin && !superAdmin.employeeCreatedBy) {
    await prisma.employee.update({
      where: { employeeId: superAdmin.employeeId },
      data: { employeeCreatedBy: superAdmin.employeeId },
    });
    console.log("  ✅ Super Admin creator updated");
  }
}

// ==================== MAIN ====================

async function main() {
  console.log("🌱 ===========================================");
  console.log("🌱 Starting RBAC Standard Seed");
  console.log("🌱 ===========================================\n");

  // Step 1: Seed Permissions
  const permissionMap = await seedPermissions();

  // Step 2: Seed Departments
  const departmentMap = await seedDepartments();

  // Step 3: Seed Roles with Permissions
  const roleMap = await seedRoles(permissionMap);

  // Step 4: Seed Employees with Roles and Accounts
  const employeeMap = await seedEmployees(departmentMap, roleMap);

  // Step 5: Update Super Admin creator to self
  await updateSuperAdminCreator(employeeMap);

  console.log("\n🎉 ===========================================");
  console.log("🎉 Seed completed successfully!");
  console.log("🎉 ===========================================");
  console.log("\n📋 Default Login Credentials:");
  console.log("   Username: superadmin");
  console.log("   Password: Password123!");
  console.log("\n   Or use any employee email with the same password");
  console.log("   Example: john.smith / Password123!");
  console.log("\n📊 Summary:");
  console.log(`   - Permissions: ${Object.keys(permissionMap).length}`);
  console.log(`   - Departments: ${Object.keys(departmentMap).length}`);
  console.log(`   - Roles: ${Object.keys(roleMap).length}`);
  console.log(`   - Employees: ${Object.keys(employeeMap).length}`);
}

main()
  .catch((e) => {
    console.error("\n❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
