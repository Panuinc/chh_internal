import { ModulePage, SubMenu } from "@/components";
import { AlertCircle } from "lucide-react";

function ProductionSidebar() {
  const stats = {
    totalEmployees: 150,
    departments: 8,
    pendingApprovals: 5,
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-full p-2 gap-2 border-1 border-default">
      <div className="flex items-center justify-center w-full h-fit p-2 gap-2">
        Quick Stats
      </div>

      <div className="flex flex-col items-center justify-center w-full h-fit gap-2">
        <StatItem label="Total Employees" value={stats.totalEmployees} />
        <StatItem label="Departments" value={stats.departments} />
        <StatItem label="Pending Approvals" value={stats.pendingApprovals} />
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="flex items-center justify-between w-full h-full gap-2 border-b-1 border-default">
      <div className="flex items-center justify-center w-full h-full p-2 gap-2">
        {label}
      </div>
      <div className="flex items-center justify-center w-full h-full p-2 gap-2">
        {value}
      </div>
    </div>
  );
}

export default function UIProduction({ menu, isEmpty }) {
  if (!menu) {
    return (
      <div className="flex items-center justify-center w-full h-full p-2 gap-2 border-1 border-default">
        <div className="flex items-center justify-center w-full h-full p-2 gap-2 border-1 border-default">
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
      sidebar={<ProductionSidebar />}
    >
      {isEmpty ? (
        <div className="col-span-full text-center justify-center w-full p-2 gap-2">
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
