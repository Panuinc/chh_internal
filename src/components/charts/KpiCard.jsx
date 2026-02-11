import { TrendingUp, TrendingDown } from "lucide-react";

export default function KpiCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  trendValue,
}) {
  return (
    <div className="flex flex-col justify-between p-2 rounded-lg border bg-default-50/50 border-default text-foreground min-h-[100px]">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] text-default-400 uppercase tracking-wider">
            {title}
          </span>
          <span className="text-xl font-bold">{value}</span>
          {subValue && (
            <span className="text-[11px] text-default-400">{subValue}</span>
          )}
        </div>
        {Icon && (
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-default-100">
            <Icon className="w-4 h-4 text-default-500" />
          </div>
        )}
      </div>
      {trend && (
        <div
          className={`flex items-center gap-2 text-[11px] ${
            trend === "up" ? "text-success" : "text-danger"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
