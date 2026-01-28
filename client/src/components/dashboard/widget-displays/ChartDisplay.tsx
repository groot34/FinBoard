import { useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { extractArrayData, formatValue } from "@/lib/api-utils";
import type { WidgetConfig } from "@shared/schema";

interface ChartDisplayProps {
  widget: WidgetConfig;
}

const CHART_COLORS = [
  "hsl(160 84% 39%)",
  "hsl(200 80% 55%)",
  "hsl(280 70% 60%)",
  "hsl(40 90% 60%)",
  "hsl(0 72% 55%)",
];

export function ChartDisplay({ widget }: ChartDisplayProps) {
  const { data, selectedFields, chartType = "line" } = widget;

  const chartData = useMemo(() => {
    const extracted = extractArrayData(data, selectedFields);
    if (extracted.length > 0) {
      return extracted.slice(0, 50);
    }

    if (selectedFields.length > 0 && data) {
      const singlePoint: Record<string, unknown> = { name: "Current" };
      selectedFields.forEach(field => {
        const value = getValueByPath(data, field.path);
        singlePoint[field.label] = typeof value === "number" ? value : parseFloat(String(value)) || 0;
      });
      return [singlePoint];
    }

    return [];
  }, [data, selectedFields]);

  function getValueByPath(obj: unknown, path: string): unknown {
    if (!obj || typeof obj !== "object") return undefined;
    const keys = path.replace(/\[(\d+)\]/g, ".$1").split(".");
    let result: unknown = obj;
    for (const key of keys) {
      if (result === null || result === undefined) return undefined;
      if (typeof result !== "object") return undefined;
      result = (result as Record<string, unknown>)[key];
    }
    return result;
  }

  const numericFields = useMemo(() => {
    if (chartData.length === 0) return [];
    const firstRow = chartData[0];
    return selectedFields.filter(field => {
      const val = firstRow[field.label];
      return typeof val === "number" || !isNaN(parseFloat(String(val)));
    });
  }, [chartData, selectedFields]);

  if (chartData.length === 0 || numericFields.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No numeric data available for charting
      </div>
    );
  }

  const xAxisKey = chartData[0]._index !== undefined ? "_index" : 
    Object.keys(chartData[0]).find(k => k !== "_index" && typeof chartData[0][k] === "string") || "_index";

  const ChartComponent = chartType === "area" ? AreaChart : LineChart;
  const DataComponent = chartType === "area" ? Area : Line;

  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 20%)" />
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize: 10, fill: "hsl(210 15% 55%)" }}
            axisLine={{ stroke: "hsl(215 20% 25%)" }}
            tickLine={{ stroke: "hsl(215 20% 25%)" }}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: "hsl(210 15% 55%)" }}
            axisLine={{ stroke: "hsl(215 20% 25%)" }}
            tickLine={{ stroke: "hsl(215 20% 25%)" }}
            tickFormatter={(val) => formatValue(val, "number")}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(215 25% 12%)",
              border: "1px solid hsl(215 20% 20%)",
              borderRadius: "6px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "hsl(210 20% 95%)" }}
            formatter={(value: number) => [formatValue(value, "number"), ""]}
          />
          {numericFields.map((field, index) => (
            chartType === "area" ? (
              <Area
                key={field.path}
                type="monotone"
                dataKey={field.label}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ) : (
              <Line
                key={field.path}
                type="monotone"
                dataKey={field.label}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                dot={chartData.length < 20}
                activeDot={{ r: 4 }}
              />
            )
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}
