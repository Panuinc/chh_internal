import { KpiCard, ChartCard, MiniBarChart, Loading } from "@/components";
import Image from "next/image";
import {
  Users,
  FileText,
  ShieldBan,
  Calculator,
  Package,
  Layers,
} from "lucide-react";
import { useDashboardAnalytics } from "@/features/home";

function UserProfileCard({ user }) {
  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-background rounded-lg border-1 border-default">
      <div className="flex items-center justify-center">
        <Image
          src={user.avatar}
          alt="profile"
          width={64}
          height={64}
          className="rounded-full"
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="text-[13px] font-semibold text-foreground">
          {user.name}
        </div>
        <div className="text-[12px] text-default-400">{user.email}</div>
      </div>

      <div className="flex flex-col w-full gap-2 pt-3 border-t-1 border-default">
        <UserInfoRow
          label="Role"
          value={user.isSuperAdmin ? "Super Admin" : "User"}
        />
        <UserInfoRow
          label="Permissions"
          value={user.permissions?.length || 0}
        />
      </div>
    </div>
  );
}

function UserInfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between w-full text-[12px]">
      <span className="text-default-400">{label}</span>
      <span className="text-default-700 font-medium">{value}</span>
    </div>
  );
}

function ErpOverview({ data }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
        <KpiCard
          title="Employees"
          value={data.hr.totalEmployees}
          icon={Users}
          subValue={`${data.hr.activeEmployees} active`}
        />
        <KpiCard
          title="Memos"
          value={data.sales.totalMemos}
          icon={FileText}
          subValue={`${data.sales.pendingMemos} pending`}
        />
        <KpiCard
          title="Visitors"
          value={data.security.totalVisitors}
          icon={ShieldBan}
          subValue={`${data.security.checkedIn} checked in`}
        />
        <KpiCard
          title="EMS Tracked"
          value={data.accounting.totalEMS}
          icon={Calculator}
          subValue={`${data.accounting.emsSuccessRate}% success`}
        />
        <KpiCard
          title="Warehouse Items"
          value={data.warehouse?.totalItems || 0}
          icon={Layers}
          subValue={`${data.warehouse?.totalInStock || 0} in stock`}
        />
        <KpiCard
          title="Products (FG)"
          value={data.production?.totalProducts || 0}
          icon={Package}
          subValue={`${data.production?.inStock || 0} in stock`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {data.charts.monthlyMemos?.length > 0 && (
          <ChartCard title="Memos by Month">
            <MiniBarChart
              data={data.charts.monthlyMemos}
              dataKey="count"
              xKey="name"
              height={200}
              color="#404040"
              formatter={(v) => `${v} memos`}
            />
          </ChartCard>
        )}

        {data.charts.employeesByDepartment?.length > 0 && (
          <ChartCard title="Employees by Department">
            <MiniBarChart
              data={data.charts.employeesByDepartment}
              dataKey="count"
              xKey="name"
              height={200}
              color="#404040"
              formatter={(v) => `${v} employees`}
            />
          </ChartCard>
        )}
      </div>
    </div>
  );
}

export default function UIHome({ user, modules }) {
  const { data, loading } = useDashboardAnalytics();

  return (
    <div className="flex flex-col w-full h-full overflow-auto">
      <div className="w-full h-full p-2 space-y-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          <p className="text-[13px] text-default-400">
            Overview of your enterprise operations and key metrics.
          </p>
        </div>

        {loading || !data ? (
          <div className="flex items-center justify-center p-2">
            <Loading />
          </div>
        ) : (
          <ErpOverview data={data} />
        )}

        <div className="flex flex-col gap-2">
          <h2 className="text-[12px] font-medium text-default-500 uppercase tracking-wider">
            Modules
          </h2>

          <div className="flex flex-col xl:flex-row gap-2">
            {user && (
              <div className="xl:w-56 shrink-0">
                <UserProfileCard user={user} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
