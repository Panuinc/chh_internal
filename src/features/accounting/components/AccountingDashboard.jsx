import { ModulePage, KpiCard, ChartCard, MiniBarChart } from "@/components";
import { AlertCircle, Truck, CheckCircle, Clock, Activity } from "lucide-react";
import { useAccountingAnalytics } from "@/features/accounting/hooks";

function AccountingAnalytics({ data }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <KpiCard
          title="Total Tracked"
          value={data.totalRecords}
          icon={Truck}
        />
        <KpiCard
          title="Not Called"
          value={data.notCalled}
          icon={Clock}
          subValue="Awaiting contact"
        />
        <KpiCard
          title="Called & Received"
          value={data.calledReceived}
          icon={CheckCircle}
        />
        <KpiCard
          title="Success Rate"
          value={`${data.successRate}%`}
          icon={Activity}
        />
      </div>

      {data.monthlyTracking?.length > 0 && (
        <ChartCard title="EMS Tracking by Month">
          <MiniBarChart
            data={data.monthlyTracking}
            dataKey="count"
            xKey="name"
            height={200}
            color="#404040"
            formatter={(v) => `${v} records`}
          />
        </ChartCard>
      )}
    </div>
  );
}

export default function UIAccounting({ menu }) {
  const { data, loading } = useAccountingAnalytics();

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
      analytics={loading || !data ? null : <AccountingAnalytics data={data} />}
    />
  );
}
