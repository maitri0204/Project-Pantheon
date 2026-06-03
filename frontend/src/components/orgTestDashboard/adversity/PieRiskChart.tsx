"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface PieRiskChartProps {
  data: Array<{ name: string; value: number; fill: string }>;
}

export function PieRiskChart({ data }: PieRiskChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 16px 32px rgba(15, 23, 42, 0.1)",
            }}
          />
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={4}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
