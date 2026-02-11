import { ModulePage, KpiCard, ChartCard, MiniBarChart } from "@/components";
import { AlertCircle, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { useSalesAnalytics } from "@/features/sales/hooks";

function SalesAnalytics({ data }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <KpiCard
          title="Total Memos"
          value={data.totalMemos}
          icon={FileText}
        />
        <KpiCard
          title="Pending Approval"
          value={data.pendingMemos}
          icon={Clock}
          subValue={`${data.pendingSalesManager} SM / ${data.pendingCeo} CEO`}
        />
        <KpiCard
          title="Approved"
          value={data.approvedMemos}
          icon={CheckCircle}
        />
        <KpiCard
          title="Rejected"
          value={data.rejectedMemos}
          icon={XCircle}
        />
      </div>

      {data.monthlyMemos?.length > 0 && (
        <ChartCard title="Memos by Month">
          <MiniBarChart
            data={data.monthlyMemos}
            dataKey="count"
            xKey="name"
            height={200}
            color="#404040"
            formatter={(v) => `${v} memos`}
          />
        </ChartCard>
      )}
    </div>
  );
}

export default function UISales({ menu }) {
  const { data, loading } = useSalesAnalytics();

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
      analytics={loading || !data ? null : <SalesAnalytics data={data} />}
    />
  );
}
