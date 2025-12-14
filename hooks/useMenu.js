"use client";
import { useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { menuConfig } from "@/config/menu.config";

export function usePermissions() {
  const { data: session, status } = useSession();

  const permissions = useMemo(() => {
    if (status === "loading" || !session?.user?.permissions) {
      return [];
    }
    return session.user.permissions;
  }, [session, status]);

  const isSuperAdmin = useMemo(() => {
    return session?.user?.isSuperAdmin || false;
  }, [session]);

  return {
    permissions,
    isSuperAdmin,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}

export function useMenu() {
  const { permissions, isSuperAdmin, isLoading, isAuthenticated } =
    usePermissions();

  const hasPermission = useCallback(
    (permission) => {
      if (!permission) return true;
      if (isSuperAdmin) return true;
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
    [permissions, isSuperAdmin]
  );

  const modules = useMemo(() => {
    if (!isAuthenticated) return [];

    return menuConfig.modules.filter((module) =>
      hasPermission(module.permission)
    );
  }, [hasPermission, isAuthenticated]);

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
    isSuperAdmin,
    isLoading,
    isAuthenticated,
    modules,
    getSubmenu,
    hasPermission,
    getAllAccessibleMenus,
  };
}

export function useModuleMenu(moduleId) {
  const { getSubmenu, hasPermission, isLoading, isAuthenticated } = useMenu();
  const menu = getSubmenu(moduleId);

  return {
    menu,
    hasPermission,
    isEmpty: !menu || menu.items.length === 0,
    isLoading,
    isAuthenticated,
  };
}

export default useMenu;
