import { ModulePage, KpiCard, ChartCard, MiniBarChart } from "@/components";
import { AlertCircle, Package, Layers, Box, Archive } from "lucide-react";
import { useWarehouseAnalytics } from "@/features/warehouse/hooks";

function WarehouseAnalytics({ data }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <KpiCard
          title="Finished Goods"
          value={data.finishedGoods}
          icon={Package}
          subValue={`${data.finishedGoodsInStock} in stock`}
        />
        <KpiCard
          title="Raw Materials"
          value={data.rawMaterials}
          icon={Layers}
          subValue={`${data.rawMaterialsInStock} in stock`}
        />
        <KpiCard
          title="Supplies"
          value={data.supplies}
          icon={Box}
          subValue={`${data.suppliesInStock} in stock`}
        />
        <KpiCard
          title="Packing"
          value={data.packing}
          icon={Archive}
          subValue={`${data.packingInStock} in stock`}
        />
      </div>

      {data.inventoryByCategory?.length > 0 && (
        <ChartCard title="Items by Category">
          <MiniBarChart
            data={data.inventoryByCategory}
            dataKey="count"
            xKey="name"
            height={200}
            color="#404040"
            formatter={(v) => `${v} items`}
          />
        </ChartCard>
      )}
    </div>
  );
}

export default function UIWarehouse({ menu }) {
  const { data, loading } = useWarehouseAnalytics();

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
      analytics={loading || !data ? null : <WarehouseAnalytics data={data} />}
    />
  );
}
