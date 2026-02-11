import { ModulePage, KpiCard, ChartCard, MiniBarChart } from "@/components";
import { AlertCircle, Package, PackageCheck, PackageX, Ban } from "lucide-react";
import { useProductionAnalytics } from "@/features/production/hooks";

function ProductionAnalytics({ data }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <KpiCard
          title="Total Products"
          value={data.totalProducts}
          icon={Package}
        />
        <KpiCard
          title="In Stock"
          value={data.inStock}
          icon={PackageCheck}
          subValue={`${data.totalInventory} units total`}
        />
        <KpiCard
          title="Out of Stock"
          value={data.outOfStock}
          icon={PackageX}
          subValue="Needs production"
        />
        <KpiCard
          title="Blocked"
          value={data.blocked}
          icon={Ban}
        />
      </div>

      {data.topByInventory?.length > 0 && (
        <ChartCard title="Top Products by Inventory">
          <MiniBarChart
            data={data.topByInventory}
            dataKey="count"
            xKey="name"
            height={200}
            color="#404040"
            formatter={(v) => `${v} units`}
          />
        </ChartCard>
      )}
    </div>
  );
}

export default function UIProduction({ menu }) {
  const { data, loading } = useProductionAnalytics();

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
      analytics={loading || !data ? null : <ProductionAnalytics data={data} />}
    />
  );
}
