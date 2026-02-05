# RBAC Full System Migration Guide

## 1. Database Schema Changes

### Remove Models
```prisma
// ❌ ลบ Model นี้ออก
model Assign {
  assignId           String    @id @default(cuid())
  assignEmployeeId   String
  assignPermissionId String
  // ...
}
```

### Add Models
```prisma
// ✅ เพิ่ม Model ใหม่
model RolePermission {
  rolePermissionId        String   @id @default(cuid())
  rolePermissionRoleId    String
  rolePermissionPermissionId String
  rolePermissionCreatedBy String?
  rolePermissionCreatedAt DateTime?
  rolePermissionUpdatedBy String?
  rolePermissionUpdatedAt DateTime?

  role       Role       @relation(fields: [rolePermissionRoleId], references: [roleId], onDelete: Cascade)
  permission Permission @relation(fields: [rolePermissionPermissionId], references: [permissionId], onDelete: Cascade)
  createdBy  Employee?  @relation("RolePermissionCreatedBy", fields: [rolePermissionCreatedBy], references: [employeeId])
  updatedBy  Employee?  @relation("RolePermissionUpdatedBy", fields: [rolePermissionUpdatedBy], references: [employeeId])

  @@unique([rolePermissionRoleId, rolePermissionPermissionId])
  @@index([rolePermissionRoleId])
  @@index([rolePermissionPermissionId])
}

model EmployeeRole {
  employeeRoleId        String    @id @default(cuid())
  employeeRoleEmployeeId String
  employeeRoleRoleId    String
  employeeRoleCreatedBy String?
  employeeRoleCreatedAt DateTime?
  employeeRoleUpdatedBy String?
  employeeRoleUpdatedAt DateTime?

  employee Employee @relation(fields: [employeeRoleEmployeeId], references: [employeeId], onDelete: Cascade)
  role     Role     @relation(fields: [employeeRoleRoleId], references: [roleId], onDelete: Cascade)
  createdBy Employee? @relation("EmployeeRoleCreatedBy", fields: [employeeRoleCreatedBy], references: [employeeId])
  updatedBy Employee? @relation("EmployeeRoleUpdatedBy", fields: [employeeRoleUpdatedBy], references: [employeeId])

  @@unique([employeeRoleEmployeeId, employeeRoleRoleId])
  @@index([employeeRoleEmployeeId])
  @@index([employeeRoleRoleId])
}
```

### Modify Models
```prisma
// ✅ แก้ไข Employee Model
model Employee {
  // ... existing fields ...
  
  // ❌ เอาออก
  // employeeRoleId String?
  // role       Role?       @relation(fields: [employeeRoleId], references: [roleId])
  
  // ✅ เพิ่มใหม่
  employeeRoles EmployeeRole[]
  
  // ❌ เอาออก
  // assigns Assign[]
  
  // ✅ เพิ่มความสัมพันธ์ใหม่
  createdEmployeeRoles EmployeeRole[] @relation("EmployeeRoleCreatedBy")
  updatedEmployeeRoles EmployeeRole[] @relation("EmployeeRoleUpdatedBy")
  createdRolePermissions RolePermission[] @relation("RolePermissionCreatedBy")
  updatedRolePermissions RolePermission[] @relation("RolePermissionUpdatedBy")
}

// ✅ แก้ไข Role Model
model Role {
  // ... existing fields ...
  
  // ❌ เอาออก
  // employees Employee[]
  
  // ✅ เพิ่มใหม่
  rolePermissions RolePermission[]
  employeeRoles   EmployeeRole[]
}

// ✅ แก้ไข Permission Model  
model Permission {
  // ... existing fields ...
  
  // ❌ เอาออก
  // assigns Assign[]
  
  // ✅ เพิ่มใหม่
  rolePermissions RolePermission[]
}
```

---

## 2. Service Layer Changes

### Remove Files
- `src/services/hr/assign.service.js` → ลบ

### New Files

#### `src/services/hr/rolePermission.service.js`
```javascript
import prisma from "@/lib/prisma";
import { getLocalNow } from "@/lib/getLocalNow";

export const RolePermissionRepository = {
  async findByRole(roleId) {
    return prisma.rolePermission.findMany({
      where: { rolePermissionRoleId: roleId },
      include: { permission: true },
    });
  },

  async syncPermissions(roleId, permissionIds, createdBy) {
    const current = await this.findByRole(roleId);
    const currentIds = current.map(p => p.rolePermissionPermissionId);
    
    const toAdd = permissionIds.filter(id => !currentIds.includes(id));
    const toRemove = currentIds.filter(id => !permissionIds.includes(id));

    await prisma.$transaction([
      // Add new
      ...toAdd.map(pid => 
        prisma.rolePermission.create({
          data: {
            rolePermissionRoleId: roleId,
            rolePermissionPermissionId: pid,
            rolePermissionCreatedBy: createdBy,
            rolePermissionCreatedAt: getLocalNow(),
          },
        })
      ),
      // Remove old
      prisma.rolePermission.deleteMany({
        where: {
          rolePermissionRoleId: roleId,
          rolePermissionPermissionId: { in: toRemove },
        },
      }),
    ]);

    return { added: toAdd.length, removed: toRemove.length };
  },
};

export async function getRolePermissions(roleId) {
  return RolePermissionRepository.findByRole(roleId);
}

export async function syncRolePermissions(roleId, permissionIds, createdBy) {
  return RolePermissionRepository.syncPermissions(roleId, permissionIds, createdBy);
}
```

#### `src/services/hr/employeeRole.service.js`
```javascript
import prisma from "@/lib/prisma";
import { getLocalNow } from "@/lib/getLocalNow";

export const EmployeeRoleRepository = {
  async findByEmployee(employeeId) {
    return prisma.employeeRole.findMany({
      where: { employeeRoleEmployeeId: employeeId },
      include: { 
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });
  },

  async getAllPermissions(employeeId) {
    const employeeRoles = await this.findByEmployee(employeeId);
    const permissions = new Set();
    
    employeeRoles.forEach(er => {
      er.role.rolePermissions.forEach(rp => {
        permissions.add(rp.permission.permissionName);
      });
    });
    
    return Array.from(permissions);
  },

  async syncRoles(employeeId, roleIds, createdBy) {
    const current = await this.findByEmployee(employeeId);
    const currentIds = current.map(r => r.employeeRoleRoleId);
    
    const toAdd = roleIds.filter(id => !currentIds.includes(id));
    const toRemove = currentIds.filter(id => !roleIds.includes(id));

    await prisma.$transaction([
      ...toAdd.map(rid =>
        prisma.employeeRole.create({
          data: {
            employeeRoleEmployeeId: employeeId,
            employeeRoleRoleId: rid,
            employeeRoleCreatedBy: createdBy,
            employeeRoleCreatedAt: getLocalNow(),
          },
        })
      ),
      prisma.employeeRole.deleteMany({
        where: {
          employeeRoleEmployeeId: employeeId,
          employeeRoleRoleId: { in: toRemove },
        },
      }),
    ]);

    return { added: toAdd.length, removed: toRemove.length };
  },
};

export async function getEmployeeRoles(employeeId) {
  return EmployeeRoleRepository.findByEmployee(employeeId);
}

export async function getEmployeePermissions(employeeId) {
  return EmployeeRoleRepository.getAllPermissions(employeeId);
}

export async function syncEmployeeRoles(employeeId, roleIds, createdBy) {
  return EmployeeRoleRepository.syncRoles(employeeId, roleIds, createdBy);
}
```

---

## 3. API Routes Changes

### Remove
- `src/app/api/hr/assign/` → ลบทั้ง folder

### New Routes

#### `src/app/api/hr/role/[roleId]/permission/route.js`
```javascript
import { getRolePermissions, syncRolePermissions } from "@/services/hr/rolePermission.service";

export async function GET(request, { params }) {
  const { roleId } = await params;
  const permissions = await getRolePermissions(roleId);
  return Response.json({ permissions });
}

export async function PUT(request, { params }) {
  const { roleId } = await params;
  const body = await request.json();
  const result = await syncRolePermissions(roleId, body.permissionIds, body.updatedBy);
  return Response.json(result);
}
```

#### `src/app/api/hr/employee/[employeeId]/role/route.js`
```javascript
import { getEmployeeRoles, syncEmployeeRoles } from "@/services/hr/employeeRole.service";

export async function GET(request, { params }) {
  const { employeeId } = await params;
  const roles = await getEmployeeRoles(employeeId);
  return Response.json({ roles });
}

export async function PUT(request, { params }) {
  const { employeeId } = await params;
  const body = await request.json();
  const result = await syncEmployeeRoles(employeeId, body.roleIds, body.updatedBy);
  return Response.json(result);
}
```

#### `src/app/api/hr/employee/[employeeId]/permission/route.js`
```javascript
import { getEmployeePermissions } from "@/services/hr/employeeRole.service";

export async function GET(request, { params }) {
  const { employeeId } = await params;
  const permissions = await getEmployeePermissions(employeeId);
  return Response.json({ permissions });
}
```

---

## 4. Auth Layer Changes

### Modify `src/lib/auth.js`
```javascript
// ❌ เก่า: ดึงจาก Assigns
const userPermissions = await prisma.assign.findMany({
  where: { assignEmployeeId: employee.employeeId },
  include: { permission: true },
});

// ✅ ใหม่: ดึงจาก EmployeeRoles -> RolePermissions
const userRoles = await prisma.employeeRole.findMany({
  where: { employeeRoleEmployeeId: employee.employeeId },
  include: {
    role: {
      include: {
        rolePermissions: {
          include: { permission: true },
        },
      },
    },
  },
});

const userPermissions = userRoles.flatMap(er => 
  er.role.rolePermissions.map(rp => rp.permission.permissionName)
);
```

---

## 5. Frontend Changes

### Remove
- `src/app/(pages)/hr/assign/` → ลบทั้ง folder
- `src/app/(pages)/hr/_hooks/useAssign.js` → ลบ

### New UI Components

#### `src/app/(pages)/hr/_hooks/useEmployeeRole.js`
```javascript
export function useEmployeeRole() {
  const getEmployeeRoles = async (employeeId) => {
    const res = await fetch(`/api/hr/employee/${employeeId}/role`);
    return res.json();
  };

  const updateEmployeeRoles = async (employeeId, roleIds) => {
    const res = await fetch(`/api/hr/employee/${employeeId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ roleIds }),
    });
    return res.json();
  };

  return { getEmployeeRoles, updateEmployeeRoles };
}
```

#### `src/app/(pages)/hr/_hooks/useRolePermission.js`
```javascript
export function useRolePermission() {
  const getRolePermissions = async (roleId) => {
    const res = await fetch(`/api/hr/role/${roleId}/permission`);
    return res.json();
  };

  const updateRolePermissions = async (roleId, permissionIds) => {
    const res = await fetch(`/api/hr/role/${roleId}/permission`, {
      method: 'PUT',
      body: JSON.stringify({ permissionIds }),
    });
    return res.json();
  };

  return { getRolePermissions, updateRolePermissions };
}
```

### New Pages

#### `src/app/(pages)/hr/role/permission/page.js`
- หน้าจัดการ Permission ของแต่ละ Role
- เลือก Role → ติ๊ก Permission ที่ต้องการ

#### `src/app/(pages)/hr/employee/role/page.js`
- หน้าจัดการ Role ของแต่ละ Employee
- เลือก Employee → ติ๊ก Role ที่ต้องการ

---

## 6. Menu Config Changes

### Modify `src/config/menu.config.js`
```javascript
// ❌ เอาออก
{
  id: "assign",
  href: "/hr/assign",
  text: "Assign",
  permission: "hr.assign.view",
},

// ✅ เพิ่มใหม่
{
  id: "rolePermission",
  href: "/hr/role/permission",
  text: "Role Permissions",
  icon: Key,
  permission: "hr.role.permission.view",
},
{
  id: "employeeRole",
  href: "/hr/employee/role",
  text: "Employee Roles",
  icon: Users,
  permission: "hr.employee.role.view",
},
```

---

## 7. Migration Steps

### Step 1: Backup Database
```bash
mysqldump -u root -p evergreen > backup_before_rbac.sql
```

### Step 2: Update Schema
```bash
# 1. แก้ไข prisma/schema.prisma
# 2. สร้าง migration
npx prisma migrate dev --name rbac_migration

# 3. Generate client
npx prisma generate
```

### Step 3: Data Migration Script
```javascript
// prisma/migrate-assign-to-rbac.js
async function migrate() {
  // 1. ดึงข้อมูล Assign เก่าทั้งหมด
  const assigns = await prisma.assign.findMany({
    include: { employee: true, permission: true },
  });

  // 2. สร้าง Role ชั่วคราวสำหรับแต่ละ Employee (ถ้ายังไม่มี Role)
  for (const assign of assigns) {
    const employee = assign.employee;
    
    // สร้าง EmployeeRole
    await prisma.employeeRole.create({
      data: {
        employeeRoleEmployeeId: employee.employeeId,
        employeeRoleRoleId: employee.employeeRoleId, // ใช้ Role เดิมที่มี
      },
    });
  }

  // 3. ลบตาราง Assign เก่า (ทำใน migration ต่อไป)
}
```

### Step 4: Deploy Code
```bash
# 1. ลบไฟล์เก่า
rm -rf src/services/hr/assign.service.js
rm -rf src/app/api/hr/assign/
rm -rf src/app/(pages)/hr/assign/
rm -rf src/app/(pages)/hr/_hooks/useAssign.js

# 2. Deploy โค้ดใหม่
npm run build
```

### Step 5: Verify
- ทดสอบ Login
- ทดสอบดึง Permissions
- ทดสอบ Authorize

---

## 8. Permission Structure ใหม่

| Permission | คำอธิบาย |
|-----------|---------|
| `hr.role.view` | ดูหน้า Role |
| `hr.role.create` | สร้าง Role |
| `hr.role.edit` | แก้ไข Role |
| `hr.role.permission.view` | ดู Permission ของ Role |
| `hr.role.permission.edit` | แก้ไข Permission ของ Role |
| `hr.employee.role.view` | ดู Role ของ Employee |
| `hr.employee.role.edit` | แก้ไข Role ของ Employee |

---

## 9. Summary

| หมวด | เอาออก | เพิ่ม | แก้ไข |
|-----|-------|------|-------|
| **Database** | Assign model | RolePermission, EmployeeRole models | Employee, Role, Permission models |
| **Service** | assign.service.js | rolePermission.service.js, employeeRole.service.js | employee.service.js |
| **API** | /api/hr/assign/ | /api/hr/role/[id]/permission/, /api/hr/employee/[id]/role/ | auth routes |
| **Frontend** | /hr/assign/, useAssign.js | /hr/role/permission/, /hr/employee/role/, hooks ใหม่ | menu.config.js |
| **Auth** | - | - | auth.js (ดึง permissions ใหม่) |

---

**หมายเหตุ:** การ Migration นี้เป็น Breaking Change ต้องทำในช่วง Maintenance Window และ Backup ข้อมูลก่อนเริ่มทำเสมอ
