"use client";

import React from "react";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-indigo-500" />
          <h1 className="text-xl font-bold tracking-tight text-white">
            Data Analytics & Enterprise Intelligence
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Real-time server-side aggregations computed via PostgreSQL GROUP BY pipelines without transferring raw records to client memory.
        </p>
      </div>

      <AnalyticsCharts />
    </div>
  );
}
