import { ModulePage, KpiCard, ChartCard, MiniBarChart } from "@/components";
import { AlertCircle, Users, UserCheck, Building2, ScrollText } from "lucide-react";
import { useHrAnalytics } from "@/features/hr/hooks";

function HrAnalytics({ data }) {
  const accountPercent = data.totalEmployees > 0
    ? Math.round((data.activeAccounts / data.totalEmployees) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <KpiCard
          title="Total Employees"
          value={data.totalEmployees}
          icon={Users}
          subValue={`${data.activeEmployees} active`}
        />
        <KpiCard
          title="Active Accounts"
          value={data.activeAccounts}
          icon={UserCheck}
          subValue={`${accountPercent}% of employees`}
        />
        <KpiCard
          title="Departments"
          value={data.totalDepartments}
          icon={Building2}
        />
        <KpiCard
          title="Roles"
          value={data.totalRoles}
          icon={ScrollText}
          subValue={`${data.totalPermissions} permissions`}
        />
      </div>

      {data.employeesByDepartment?.length > 0 && (
        <ChartCard title="Employees by Department">
          <MiniBarChart
            data={data.employeesByDepartment}
            dataKey="count"
            xKey="name"
            height={200}
            color="#404040"
            formatter={(v) => `${v} employees`}
          />
        </ChartCard>
      )}
    </div>
  );
}

export default function UIHr({ menu }) {
  const { data, loading } = useHrAnalytics();

  if (!menu) {
    return (
      <div className="flex items-center justify-center w-full h-full p-2">
        <div className="flex items-center gap-2 p-2 bg-default-50 rounded-lg border border-default">
          <AlertCircle className="w-4 h-4 text-default-400" />
          <span className="text-[13px] text-default-500">Module configuration not found</span>
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
      showSidebar={false}
      analytics={loading || !data ? null : <HrAnalytics data={data} />}
    />
  );
}
