"use client";

import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { DailyStat } from "@/types";

export function DailyChart({ data }: { data: DailyStat[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Daily Trends (7 days)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <ReLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => d.slice(5)}
            fontSize={12}
          />
          <YAxis fontSize={12} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="earned"
            stroke="#6C63FF"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="redeemed"
            stroke="#00C9A7"
            strokeWidth={2}
            dot={false}
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}
