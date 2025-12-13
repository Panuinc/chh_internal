import { User2, Building2, Users, ScrollText, Key } from "lucide-react";

export const menuConfig = {
  modules: [
    {
      id: "hr",
      href: "/hr",
      text: "Human Resource",
      icon: User2,
      permission: "hr.view",
    },
  ],

  submenus: {
    hr: {
      title: "Human Resource",
      icon: User2,
      description: "จัดการพนักงานและแผนก",
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
            delete: "hr.employee.delete",
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
            delete: "hr.department.delete",
          },
        },
        {
          id: "assignPermission",
          href: "/hr/assignPermission",
          text: "Assign Permission",
          icon: Key,
          permission: "hr.assignPermission.view",
          requireSuperAdmin: true,
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
