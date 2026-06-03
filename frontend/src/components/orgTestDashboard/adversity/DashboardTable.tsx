"use client";

import { motion } from "framer-motion";
import type { TableColumn } from "@/components/orgTestDashboard/adversity/types";

interface DashboardTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage: string;
}

export function DashboardTable<T>({ columns, data, emptyMessage }: DashboardTableProps<T>) {
  if (!data.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-600">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50/80">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              whileHover={{ backgroundColor: "rgba(248,250,252,0.9)" }}
              className="transition-colors"
            >
              {columns.map((column) => (
                <td key={column.header} className={`px-4 py-2.5 text-sm text-slate-800 ${column.className ?? ""}`}>
                  {column.render(row)}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
