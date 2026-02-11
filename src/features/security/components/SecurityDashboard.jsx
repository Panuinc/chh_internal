import { ModulePage, KpiCard, ChartCard, MiniBarChart } from "@/components";
import { AlertCircle, Users, UserCheck, Shield, Activity } from "lucide-react";
import { useSecurityAnalytics } from "@/features/security/hooks";

function SecurityAnalytics({ data }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <KpiCard
          title="Visitors Today"
          value={data.visitorsToday}
          icon={Users}
        />
        <KpiCard
          title="Active Visitors"
          value={data.checkedIn}
          icon={UserCheck}
          subValue="Currently checked in"
        />
        <KpiCard
          title="Patrols Today"
          value={data.patrolsToday}
          icon={Shield}
        />
        <KpiCard
          title="Total Patrols"
          value={data.totalPatrols}
          icon={Activity}
        />
      </div>

      {data.dailyVisitors?.length > 0 && (
        <ChartCard title="Daily Visitors (This Week)">
          <MiniBarChart
            data={data.dailyVisitors}
            dataKey="visitors"
            xKey="name"
            height={200}
            color="#404040"
            formatter={(v) => `${v} visitors`}
          />
        </ChartCard>
      )}
    </div>
  );
}

export default function UISecurity({ menu }) {
  const { data, loading } = useSecurityAnalytics();

  if (!menu) {
    return (
      <div className="flex items-center justify-center w-full h-full p-2">
        <div className="flex items-center gap-2 p-2 bg-default-50 rounded-lg border-1 border-default">
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
      analytics={loading || !data ? null : <SecurityAnalytics data={data} />}
    />
  );
}
