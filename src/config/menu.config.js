import {
  User2,
  Building2,
  Users,
  ScrollText,
  Key,
  UserLock,
  ShieldBan,
  Box,
  Package,
  Pickaxe,
  DoorOpen,
  BadgeDollarSign,
  ListOrdered,
  FileText,
  UserCircle,
  Calculator,
  Truck,
} from "lucide-react";

export const moduleGroups = [
  { id: "admin", label: "Administration", moduleIds: ["hr", "security"] },
  {
    id: "operations",
    label: "Operations",
    moduleIds: ["warehouse", "production"],
  },
  { id: "business", label: "Business", moduleIds: ["sales", "accounting"] },
];

export const menuConfig = {
  modules: [
    {
      id: "hr",
      href: "/hr",
      text: "Human Resource",
      icon: User2,
      permission: "hr.view",
    },
    {
      id: "security",
      href: "/security",
      text: "security",
      icon: ShieldBan,
      permission: "security.view",
    },
    {
      id: "warehouse",
      href: "/warehouse",
      text: "warehouse",
      icon: Box,
      permission: "warehouse.view",
    },
    {
      id: "production",
      href: "/production",
      text: "production",
      icon: Pickaxe,
      permission: "production.view",
    },
    {
      id: "sales",
      href: "/sales",
      text: "sales",
      icon: BadgeDollarSign,
      permission: "sales.view",
    },
    {
      id: "accounting",
      href: "/accounting",
      text: "accounting",
      icon: Calculator,
      permission: "accounting.view",
    },
  ],

  submenus: {
    hr: {
      title: "Human Resource",
      icon: User2,
      description: "Management About Human Resource",
      items: [
        {
          id: "employee",
          text: "Employee",
          icon: Users,
          permission: "hr.employee.view",
          children: [
            {
              id: "employeeList",
              href: "/hr/employee",
              text: "Employee List",
              permission: "hr.employee.view",
              actions: {
                view: "hr.employee.view",
                create: "hr.employee.create",
                edit: "hr.employee.edit",
              },
            },
            {
              id: "employeeRole",
              href: "/hr/employee/role",
              text: "Employee Roles",
              permission: "hr.employee.role.view",
              requireSuperAdmin: true,
            },
          ],
        },

        {
          id: "account",
          href: "/hr/account",
          text: "Account",
          icon: UserLock,
          permission: "hr.account.view",
          actions: {
            view: "hr.account.view",
            create: "hr.account.create",
            edit: "hr.account.edit",
          },
        },

        {
          id: "permission",
          href: "/hr/permission",
          text: "Permission",
          icon: ScrollText,
          permission: "hr.permission.view",
          requireSuperAdmin: true,
        },

        {
          id: "department",
          href: "/hr/department",
          text: "Department",
          icon: Building2,
          permission: "hr.department.view",
          actions: {
            view: "hr.department.view",
            create: "hr.department.create",
            edit: "hr.department.edit",
          },
        },

        {
          id: "role",
          text: "Role",
          icon: ScrollText,
          permission: "hr.role.view",
          children: [
            {
              id: "roleList",
              href: "/hr/role",
              text: "Role List",
              permission: "hr.role.view",
              actions: {
                view: "hr.role.view",
                create: "hr.role.create",
                edit: "hr.role.edit",
              },
            },
            {
              id: "rolePermission",
              href: "/hr/role/permission",
              text: "Role Permissions",
              permission: "hr.role.permission.view",
              requireSuperAdmin: true,
            },
          ],
        },
      ],
    },
    security: {
      title: "security",
      icon: ShieldBan,
      description: "Management About security",
      items: [
        {
          id: "visitor",
          href: "/security/visitor",
          text: "Visitor",
          icon: Users,
          permission: "security.visitor.view",
          actions: {
            view: "security.visitor.view",
            create: "security.visitor.create",
            edit: "security.visitor.edit",
          },
        },
        {
          id: "patrol",
          href: "/security/patrol",
          text: "Patrol",
          icon: Users,
          permission: "security.patrol.view",
          actions: {
            view: "security.patrol.view",
            create: "security.patrol.create",
          },
        },
      ],
    },
    warehouse: {
      title: "warehouse",
      icon: Box,
      description: "Management About warehouse",
      items: [
        {
          id: "packing",
          href: "/warehouse/packing",
          text: "Packing",
          icon: Package,
          permission: "warehouse.packing.view",
          actions: {
            view: "warehouse.packing.view",
            create: "warehouse.packing.create",
            edit: "warehouse.packing.edit",
          },
        },
        {
          id: "supply",
          href: "/warehouse/supply",
          text: "Supply",
          icon: Package,
          permission: "warehouse.supply.view",
          actions: {
            view: "warehouse.supply.view",
            create: "warehouse.supply.create",
            edit: "warehouse.supply.edit",
          },
        },
        {
          id: "finishedGoods",
          href: "/warehouse/finishedGoods",
          text: "Finished Goods",
          icon: Package,
          permission: "warehouse.finishedGoods.view",
          actions: {
            view: "warehouse.finishedGoods.view",
            create: "warehouse.finishedGoods.create",
            edit: "warehouse.finishedGoods.edit",
          },
        },
        {
          id: "rawMaterial",
          href: "/warehouse/rawMaterial",
          text: "Raw Material",
          icon: Package,
          permission: "warehouse.rawMaterial.view",
          actions: {
            view: "warehouse.rawMaterial.view",
            create: "warehouse.rawMaterial.create",
            edit: "warehouse.rawMaterial.edit",
          },
        },
      ],
    },
    production: {
      title: "production",
      icon: Pickaxe,
      description: "Management About production",
      items: [
        {
          id: "doorBom",
          href: "/production/doorBom",
          text: "Door Bom",
          icon: DoorOpen,
          permission: "production.doorBom.view",
          actions: {
            view: "production.doorBom.view",
            create: "production.doorBom.create",
            edit: "production.doorBom.edit",
          },
        },
      ],
    },
    sales: {
      title: "sales",
      icon: BadgeDollarSign,
      description: "Management About sales",
      items: [
        {
          id: "salesOrderOnline",
          href: "/sales/salesOrderOnline",
          text: "Sales Order Online",
          icon: ListOrdered,
          permission: "sales.salesOrderOnline.view",
          actions: {
            view: "sales.salesOrderOnline.view",
            create: "sales.salesOrderOnline.create",
            edit: "sales.salesOrderOnline.edit",
          },
        },
        {
          id: "memo",
          href: "/sales/memo",
          text: "Memo",
          icon: FileText,
          permission: "sales.memo.view",
          actions: {
            view: "sales.memo.view",
            create: "sales.memo.create",
            edit: "sales.memo.edit",
          },
        },
      ],
    },
    accounting: {
      title: "accounting",
      icon: Calculator,
      description: "Management About accounting",
      items: [
        {
          id: "checkTagEMS",
          href: "/accounting/checkTagEMS",
          text: "Check Tag EMS",
          icon: Truck,
          permission: "accounting.checkTagEMS.view",
          actions: {
            view: "accounting.checkTagEMS.view",
          },
        },
      ],
    },
  },
};

export function getProtectedRoutes() {
  const routes = {};

  menuConfig.modules.forEach((module) => {
    if (module.href && module.permission) {
      routes[module.href] = {
        permission: module.permission,
        requireSuperAdmin: module.requireSuperAdmin || false,
      };
    }
  });

  Object.values(menuConfig.submenus).forEach((submenu) => {
    submenu.items.forEach((item) => {
      if (item.children) {
        item.children.forEach((child) => {
          if (child.href && child.permission) {
            routes[child.href] = {
              permission: child.permission,
              requireSuperAdmin: child.requireSuperAdmin || false,
            };
          }
        });
      } else if (item.href && item.permission) {
        routes[item.href] = {
          permission: item.permission,
          requireSuperAdmin: item.requireSuperAdmin || false,
        };
      }
    });
  });

  return routes;
}

export function getAllDefinedPermissions() {
  const permissions = new Set();

  menuConfig.modules.forEach((module) => {
    if (module.permission) {
      permissions.add(module.permission);
    }
  });

  Object.values(menuConfig.submenus).forEach((submenu) => {
    submenu.items.forEach((item) => {
      if (item.permission) {
        permissions.add(item.permission);
      }
      if (item.actions) {
        Object.values(item.actions).forEach((action) => {
          permissions.add(action);
        });
      }
      if (item.children) {
        item.children.forEach((child) => {
          if (child.permission) {
            permissions.add(child.permission);
          }
          if (child.actions) {
            Object.values(child.actions).forEach((action) => {
              permissions.add(action);
            });
          }
        });
      }
    });
  });

  return Array.from(permissions).sort();
}

export default menuConfig;
