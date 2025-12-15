import { ModulePage, SubMenu } from "@/components";
import { AlertCircle } from "lucide-react";

function HrSidebar() {
  const stats = {
    totalEmployees: 150,
    departments: 8,
    pendingApprovals: 5,
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-2 gap-2 border-2 rounded-xl">
      <div>Quick Stats</div>

      <div className="flex flex-col w-full p-2 gap-2">
        <StatItem label="Total Employees" value={stats.totalEmployees} />
        <StatItem label="Departments" value={stats.departments} />
        <StatItem label="Pending Approvals" value={stats.pendingApprovals} />
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="flex justify-between w-full h-full p-2 border-b-2">
      <span className="opacity-70">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function UIHr({ menu, isEmpty }) {
  if (!menu) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex items-center p-2 gap-2">
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
        <div className="col-span-full text-center">
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
