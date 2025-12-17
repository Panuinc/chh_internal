import {
  User2,
  Building2,
  Users,
  ScrollText,
  Key,
  UserLock,
  ShieldBan,
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
