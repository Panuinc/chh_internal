"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function MiniBarChart({
  data,
  dataKey = "value",
  xKey = "name",
  height = 220,
  color = "#404040",
  colors,
  formatter,
  layout = "horizontal",
  yWidth,
}) {
  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center text-[12px] text-default-400"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  const isVertical = layout === "vertical";

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={isVertical ? "vertical" : "horizontal"}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          {isVertical ? (
            <>
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#b0b0b0" />
              <YAxis
                type="category"
                dataKey={xKey}
                tick={{ fontSize: 11 }}
                stroke="#b0b0b0"
                width={yWidth || 80}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey={xKey}
                tick={{ fontSize: 11 }}
                stroke="#b0b0b0"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} stroke="#b0b0b0" />
            </>
          )}
          <Tooltip
            formatter={formatter || ((v) => v)}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar
            dataKey={dataKey}
            radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            fill={color}
          >
            {colors &&
              data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
