"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
} from "lucide-react";
import { useMenu, useModuleMenu } from "@/hooks";
import { moduleGroups } from "@/config/menu.config";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";

function PrimarySidebar({
  modules,
  activeModuleId,
  userInitial,
  isSigningOut,
  onSignOut,
  collapsed,
  onToggleCollapse,
}) {
  const pathname = usePathname();
  const isHome = pathname === "/home" || pathname === "/profile";

  if (collapsed) {
    return (
      <aside className="flex flex-col items-center w-[50px] h-full bg-background border-r-1 border-default shrink-0">
        <div className="flex items-center justify-center h-10 shrink-0">
          <Link href="/home">
            <Image src="/logo/logo-01.png" alt="logo" width={24} height={24} />
          </Link>
        </div>

        <nav className="flex-1 flex flex-col items-center gap-2 p-2 overflow-y-auto">
          <Link href="/home" title="Home">
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-md transition-colors cursor-pointer
                ${isHome ? "bg-default-200 text-foreground" : "text-default-400 hover:bg-default-100 hover:text-default-600"}`}
            >
              <Home className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </div>
          </Link>

          <div className="w-5 border-t-1 border-default" />

          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModuleId === module.id;
            return (
              <Link key={module.id} href={module.href} title={module.text}>
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-md transition-colors cursor-pointer
                    ${isActive ? "bg-default-200 text-foreground" : "text-default-400 hover:bg-default-100 hover:text-default-600"}`}
                >
                  <Icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-2 p-2 border-t-1 border-default shrink-0">
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar"
            className="flex items-center justify-center w-9 h-9 rounded-md text-default-400 hover:bg-default-100 hover:text-default-600 transition-colors cursor-pointer"
          >
            <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>

          <Dropdown placement="right-end">
            <DropdownTrigger>
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-default-200 text-default-600 text-[11px] font-semibold cursor-pointer hover:bg-default-300 transition-colors">
                {userInitial}
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu" variant="flat">
              <DropdownItem
                key="profile"
                href="/profile"
                startContent={<User className="w-4 h-4" />}
              >
                Profile
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                onPress={!isSigningOut ? onSignOut : undefined}
                startContent={<LogOut className="w-4 h-4" />}
              >
                {isSigningOut ? "Signing out..." : "Log out"}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </aside>
    );
  }

  const groupedModules = moduleGroups
    .map((group) => ({
      ...group,
      modules: group.moduleIds
        .map((id) => modules.find((m) => m.id === id))
        .filter(Boolean),
    }))
    .filter((group) => group.modules.length > 0);

  const groupedIds = moduleGroups.flatMap((g) => g.moduleIds);
  const ungrouped = modules.filter((m) => !groupedIds.includes(m.id));

  return (
    <aside className="flex flex-col w-[200px] h-full bg-background border-r-1 border-default shrink-0">
      <div className="flex items-center justify-between p-2 h-10 shrink-0 border-b-1 border-default">
        <Link href="/home" className="flex items-center gap-2">
          <Image src="/logo/logo-01.png" alt="logo" width={22} height={22} />
          <span className="text-[13px] font-semibold text-foreground tracking-tight">
            CHH Internal
          </span>
        </Link>
        <button
          onClick={onToggleCollapse}
          title="Collapse sidebar"
          className="flex items-center justify-center w-7 h-7 rounded-md text-default-400 hover:bg-default-100 hover:text-default-600 transition-colors cursor-pointer"
        >
          <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="p-2">
        <Link href="/home" className="block w-full">
          <div
            className={`flex items-center gap-2 p-2 rounded-md text-[13px] transition-colors cursor-pointer
              ${isHome ? "bg-default-200 text-foreground font-medium" : "text-default-500 hover:bg-default-100 hover:text-default-700"}`}
          >
            <Home className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span className="truncate">Home</span>
          </div>
        </Link>
      </div>

      <div>
        <div className="border-t-1 border-default" />
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-3">
        {groupedModules.map((group) => (
          <div key={group.id} className="space-y-px">
            <div className="p-2 text-[10px] font-semibold text-default-400 uppercase tracking-wider select-none">
              {group.label}
            </div>
            {group.modules.map((module) => {
              const Icon = module.icon;
              const isActive =
                pathname === module.href ||
                pathname.startsWith(module.href + "/");
              return (
                <Link
                  key={module.id}
                  href={module.href}
                  className="block w-full"
                >
                  <div
                    className={`flex items-center gap-2 p-2 rounded-md text-[13px] transition-colors cursor-pointer
                      ${isActive ? "bg-default-200 text-foreground font-medium" : "text-default-500 hover:bg-default-100 hover:text-default-700"}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                    <span className="truncate capitalize">{module.text}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}

        {ungrouped.length > 0 && (
          <div className="space-y-px">
            <div className="p-2 text-[10px] font-semibold text-default-400 uppercase tracking-wider select-none">
              Other
            </div>
            {ungrouped.map((module) => {
              const Icon = module.icon;
              const isActive =
                pathname === module.href ||
                pathname.startsWith(module.href + "/");
              return (
                <Link
                  key={module.id}
                  href={module.href}
                  className="block w-full"
                >
                  <div
                    className={`flex items-center gap-2 p-2 rounded-md text-[13px] transition-colors cursor-pointer
                      ${isActive ? "bg-default-200 text-foreground font-medium" : "text-default-500 hover:bg-default-100 hover:text-default-700"}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                    <span className="truncate capitalize">{module.text}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <div className="p-2 border-t-1 border-default shrink-0">
        <Dropdown placement="right-end">
          <DropdownTrigger>
            <button className="flex items-center gap-2 w-full p-2 rounded-md text-default-500 hover:bg-default-100 hover:text-default-700 transition-colors cursor-pointer">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-default-200 text-default-600 text-[11px] font-semibold shrink-0">
                {userInitial}
              </div>
              <span className="text-[13px] truncate">Profile</span>
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="User menu" variant="flat">
            <DropdownItem
              key="profile"
              href="/profile"
              startContent={<User className="w-4 h-4" />}
            >
              Profile
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              onPress={!isSigningOut ? onSignOut : undefined}
              startContent={<LogOut className="w-4 h-4" />}
            >
              {isSigningOut ? "Signing out..." : "Log out"}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </aside>
  );
}

function CollapsibleMenuItem({ item }) {
  const pathname = usePathname();
  const children = item.children || [];
  const Icon = item.icon;

  const hasActiveChild = children.some(
    (child) =>
      pathname === child.href || pathname.startsWith(child.href + "/")
  );
  const [open, setOpen] = useState(hasActiveChild);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 w-full p-2 rounded-md text-[13px] transition-colors cursor-pointer
          ${hasActiveChild
            ? "text-foreground font-medium"
            : "text-default-500 hover:bg-default-100 hover:text-default-700"
          }`}
      >
        {Icon && <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />}
        <span className="truncate flex-1 text-left">{item.text}</span>
        <ChevronRight
          className={`w-3.5 h-3.5 shrink-0 text-default-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          strokeWidth={1.5}
        />
      </button>

      {open && children.length > 0 && (
        <div className="p-2 border-l-1 border-default space-y-px">
          {children.map((child) => {
            const isActive =
              pathname === child.href ||
              pathname.startsWith(child.href + "/");
            return (
              <Link key={child.id} href={child.href} className="block w-full">
                <div
                  className={`flex items-center gap-2 p-2 rounded-md text-[12px] transition-colors cursor-pointer
                    ${isActive
                      ? "bg-default-200 text-foreground font-medium"
                      : "text-default-400 hover:bg-default-100 hover:text-default-600"
                    }`}
                >
                  <span className="truncate">{child.text}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SecondaryPanel({ moduleId }) {
  const pathname = usePathname();
  const { menu } = useModuleMenu(moduleId);
  const items = menu?.items || [];
  const title = menu?.title || moduleId;

  return (
    <aside className="flex flex-col w-[220px] h-full bg-background border-r-1 border-default shrink-0">
      <div className="p-2 h-10 flex items-center shrink-0 border-b-1 border-default">
        <span className="text-[13px] font-semibold text-foreground capitalize truncate">
          {title}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-px">
        {items.map((item) => {
          if (item.children && item.children.length > 0) {
            return <CollapsibleMenuItem key={item.id} item={item} />;
          }

          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.id} href={item.href} className="block w-full">
              <div
                className={`flex items-center gap-2 p-2 rounded-md text-[13px] transition-colors cursor-pointer
                  ${isActive
                    ? "bg-default-200 text-foreground font-medium"
                    : "text-default-500 hover:bg-default-100 hover:text-default-700"
                  }`}
              >
                {Icon && (
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                )}
                <span className="truncate">{item.text}</span>
              </div>
            </Link>
          );
        })}

        {items.length === 0 && (
          <div className="p-2 text-[12px] text-default-400 text-center">
            No items available
          </div>
        )}
      </nav>
    </aside>
  );
}

export default function Sidebar({
  userInitial = "U",
  isSigningOut = false,
  onSignOut,
}) {
  const pathname = usePathname();
  const { modules } = useMenu();
  const [collapsed, setCollapsed] = useState(false);

  const isHomePage = pathname === "/home" || pathname === "/profile";
  const activeModuleId =
    modules.find(
      (m) => pathname.startsWith(m.href + "/") || pathname === m.href
    )?.id || null;

  return (
    <>
      <PrimarySidebar
        modules={modules}
        activeModuleId={activeModuleId}
        userInitial={userInitial}
        isSigningOut={isSigningOut}
        onSignOut={onSignOut}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {activeModuleId && !isHomePage && (
        <SecondaryPanel moduleId={activeModuleId} />
      )}
    </>
  );
}
