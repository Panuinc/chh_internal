"use client";
import { ModulePage, SubMenu } from "@/components";
import { useModuleMenu } from "@/hooks/useMenu";
import { AlertCircle } from "lucide-react";

function HrSidebar() {
  const stats = {
    totalEmployees: 150,
    departments: 8,
    pendingApprovals: 5,
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full gap-2 p-2">
      <div className="text-lg font-semibold">Quick Stats</div>

      <div className="flex flex-col w-full gap-2 text-sm">
        <StatItem label="Total Employees" value={stats.totalEmployees} />
        <StatItem label="Departments" value={stats.departments} />
        <StatItem label="Pending Approvals" value={stats.pendingApprovals} />
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="flex justify-between w-full p-2 border-b border-foreground/20">
      <span className="opacity-70">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function UIHr() {
  const { menu, isEmpty } = useModuleMenu("hr");

  if (!menu) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex items-center gap-2 text-danger">
          <AlertCircle />
          <span>Module configuration not found</span>
        </div>
      </div>
    );
  }

  const Icon = menu.icon;

  return (
    <ModulePage
      icon={<Icon />}
      title={menu.title}
      description={menu.description}
      sidebar={<HrSidebar />}
    >
      {isEmpty ? (
        <div className="col-span-full text-center text-foreground/50">
          No accessible menu items. Please contact administrator.
        </div>
      ) : (
        menu.items.map((item) => (
          <SubMenu
            key={item.id}
            href={item.href}
            text={item.text}
            icon={item.icon}
          />
        ))
      )}
    </ModulePage>
  );
}
