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
} from "lucide-react";

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
  ],

  submenus: {
    hr: {
      title: "Human Resource",
      icon: User2,
      description: "Management About Human Resource",
      items: [
        {
          id: "employee",
          href: "/hr/employee",
          text: "Employee",
          icon: Users,
          permission: "hr.employee.view",
          actions: {
            view: "hr.employee.view",
            create: "hr.employee.create",
            edit: "hr.employee.edit",
          },
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
          id: "assign",
          href: "/hr/assign",
          text: "Assign",
          icon: Key,
          permission: "hr.assign.view",
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
          id: "catPacking",
          href: "/warehouse/catPacking",
          text: "Category Packing",
          icon: Package,
          permission: "warehouse.catPacking.view",
          actions: {
            view: "warehouse.catPacking.view",
            create: "warehouse.catPacking.create",
            edit: "warehouse.catPacking.edit",
          },
        },
         {
          id: "catSupply",
          href: "/warehouse/catSupply",
          text: "Category Supply",
          icon: Package,
          permission: "warehouse.catSupply.view",
          actions: {
            view: "warehouse.catSupply.view",
            create: "warehouse.catSupply.create",
            edit: "warehouse.catSupply.edit",
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
          id: "oneDoor",
          href: "/production/oneDoor",
          text: "One Door Optimize",
          icon: DoorOpen,
          permission: "production.oneDoor.view",
          actions: {
            view: "production.oneDoor.view",
            create: "production.oneDoor.create",
            edit: "production.oneDoor.edit",
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
          id: "salesOrder",
          href: "/sales/salesOrder",
          text: "Sales Order Online",
          icon: ListOrdered,
          permission: "sales.salesOrder.view",
          actions: {
            view: "sales.salesOrder.view",
            create: "sales.salesOrder.create",
            edit: "sales.salesOrder.edit",
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
      if (item.href && item.permission) {
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
    });
  });

  return Array.from(permissions).sort();
}

export default menuConfig;
