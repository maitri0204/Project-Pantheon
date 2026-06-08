"use client";

import { motion } from "framer-motion";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  noPad?: boolean;
}

export function ChartCard({ title, description, children, action, noPad }: ChartCardProps) {
  return (
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5">
        <div>
          <h3 className="text-sm font-bold text-black">{title}</h3>
          {description ? <p className="mt-0.5 text-sm font-medium text-black">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className={noPad ? "" : "px-5 pb-5"}>{children}</div>
    </motion.section>
  );
}
