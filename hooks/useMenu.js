"use client";
import { useMemo, useCallback } from "react";
import { menuConfig } from "@/config/menu.config";

export function usePermissions() {
  const mockPermissions = [
    "setting.view",
    "setting.aa.view",
    "setting.bb.view",
    "setting.cc.view",

    "hr.view",
    "hr.department.view",
    "hr.employee.view",
    "hr.attendance.view",
    "hr.permission.view",
  ];

  return mockPermissions;
}

export function useMenu() {
  const permissions = usePermissions();
  const hasPermission = useCallback(
    (permission) => {
      if (!permission) return true;

      if (permissions.includes(permission)) return true;

      const wildcardPermissions = permissions.filter((p) => p.endsWith(".*"));
      for (const wp of wildcardPermissions) {
        const prefix = wp.slice(0, -2);
        if (permission.startsWith(prefix)) return true;
      }

      if (permissions.includes("*") || permissions.includes("admin")) {
        return true;
      }

      return false;
    },
    [permissions]
  );

  const modules = useMemo(() => {
    return menuConfig.modules.filter((module) =>
      hasPermission(module.permission)
    );
  }, [hasPermission]);

  const getSubmenu = useCallback(
    (moduleId) => {
      const submenu = menuConfig.submenus[moduleId];
      if (!submenu) return null;

      return {
        ...submenu,
        items: submenu.items.filter((item) => hasPermission(item.permission)),
      };
    },
    [hasPermission]
  );

  const getAllAccessibleMenus = useMemo(() => {
    const accessible = [];

    modules.forEach((module) => {
      accessible.push({
        type: "module",
        ...module,
      });

      const submenu = menuConfig.submenus[module.id];
      if (submenu) {
        submenu.items
          .filter((item) => hasPermission(item.permission))
          .forEach((item) => {
            accessible.push({
              type: "submenu",
              parentId: module.id,
              ...item,
            });
          });
      }
    });

    return accessible;
  }, [modules, hasPermission]);

  return {
    permissions,
    modules,
    getSubmenu,
    hasPermission,
    getAllAccessibleMenus,
  };
}

export function useModuleMenu(moduleId) {
  const { getSubmenu, hasPermission } = useMenu();
  const menu = getSubmenu(moduleId);

  return {
    menu,
    hasPermission,
    isEmpty: !menu || menu.items.length === 0,
  };
}

export default useMenu;
