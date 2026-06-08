"use client";

import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface LineTrendChartProps {
  data: Array<Record<string, string | number>>;
  xKey?: string;
  primaryKey: string;
  secondaryKey?: string;
  tertiaryKey?: string;
  emptyMessage?: string;
}

export function LineTrendChart({
  data,
  xKey = "week",
  primaryKey,
  secondaryKey,
  tertiaryKey,
  emptyMessage = "No trend data available yet",
}: LineTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
          <TrendingUp className="h-5 w-5 text-sky-400" />
        </div>
        <p className="text-sm font-semibold text-black">{emptyMessage}</p>
        <p className="text-xs text-black">Analytics will appear once assessments are completed</p>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} stroke="#000000" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#000000" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ stroke: "#bae6fd", strokeWidth: 1 }}
            contentStyle={{
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 16px 32px rgba(15, 23, 42, 0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey={primaryKey}
            stroke="#0ea5e9"
            strokeWidth={3}
            dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#0ea5e9", strokeWidth: 0 }}
            isAnimationActive
          />
          {secondaryKey ? (
            <Line
              type="monotone"
              dataKey={secondaryKey}
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: "#22c55e", strokeWidth: 0 }}
              isAnimationActive
            />
          ) : null}
          {tertiaryKey ? (
            <Line
              type="monotone"
              dataKey={tertiaryKey}
              stroke="#f43f5e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: "#f43f5e", strokeWidth: 0 }}
              isAnimationActive
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
