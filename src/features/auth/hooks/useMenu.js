"use client";
import { useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { menuConfig } from "@/config/menu.config";

export function useSessionUser() {
  const { data: session, status } = useSession();

  return useMemo(() => {
    if (status === "loading" || !session?.user) {
      return {
        userId: null,
        userName: null,
        userEmail: null,
        isLoading: true,
        isAuthenticated: false,
      };
    }

    const user = session.user;

    return {
      userId: user.id || user.userId || user.employeeId || null,
      userName:
        user.name ||
        user.userName ||
        (user.employeeFirstName && user.employeeLastName
          ? `${user.employeeFirstName} ${user.employeeLastName}`
          : null),
      userEmail: user.email || null,
      isLoading: false,
      isAuthenticated: true,
    };
  }, [session, status]);
}

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

  const checkPermission = useCallback(
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

  const canAccessMenuItem = useCallback(
    (item) => {
      if (item.requireSuperAdmin && !isSuperAdmin) {
        return false;
      }
      return checkPermission(item.permission);
    },
    [checkPermission, isSuperAdmin]
  );

  const hasPermission = useCallback(
    (permission, requireSuperAdmin = false) => {
      if (requireSuperAdmin && !isSuperAdmin) {
        return false;
      }
      return checkPermission(permission);
    },
    [checkPermission, isSuperAdmin]
  );

  const modules = useMemo(() => {
    if (!isAuthenticated) return [];

    return menuConfig.modules.filter((module) => canAccessMenuItem(module));
  }, [canAccessMenuItem, isAuthenticated]);

  const getSubmenu = useCallback(
    (moduleId) => {
      const submenu = menuConfig.submenus[moduleId];
      if (!submenu) return null;

      return {
        ...submenu,
        items: submenu.items.filter((item) => canAccessMenuItem(item)),
      };
    },
    [canAccessMenuItem]
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
          .filter((item) => canAccessMenuItem(item))
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
  }, [modules, canAccessMenuItem]);

  return {
    permissions,
    isSuperAdmin,
    isLoading,
    isAuthenticated,
    modules,
    getSubmenu,
    hasPermission,
    canAccessMenuItem,
    getAllAccessibleMenus,
  };
}

export function useModuleMenu(moduleId) {
  const {
    getSubmenu,
    hasPermission,
    canAccessMenuItem,
    isSuperAdmin,
    isLoading,
    isAuthenticated,
  } = useMenu();
  const menu = getSubmenu(moduleId);

  return {
    menu,
    hasPermission,
    canAccessMenuItem,
    isSuperAdmin,
    isEmpty: !menu || menu.items.length === 0,
    isLoading,
    isAuthenticated,
  };
}

export default useMenu;
