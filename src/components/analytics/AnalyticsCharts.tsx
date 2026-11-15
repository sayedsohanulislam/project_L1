"use client";

import React from "react";
import { useAppSelector } from "@/store";
import { useGetAnalyticsQuery } from "@/store/services/api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Layers,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Activity,
  Globe2,
  RefreshCw,
  Search,
} from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

export function AnalyticsCharts() {
  const activeDatasetId = useAppSelector((state) => state.dataset.activeDatasetId);
  const { data: analytics, isLoading, refetch, isFetching } = useGetAnalyticsQuery(
    activeDatasetId || "",
    { skip: !activeDatasetId }
  );

  if (isLoading || !analytics) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400 text-xs">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
        Aggregating telemetry over database records...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Records */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Records</span>
            <Layers className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-white font-mono">
            {analytics.totalRecords.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-medium">100% indexed & searchable</span>
        </div>

        {/* Aggregated Revenue */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-400 font-mono">
            ${(analytics.metrics.totalRevenue / 1_000_000).toFixed(2)}M
          </p>
          <span className="text-[11px] text-slate-400">Server-side aggregated sum</span>
        </div>

        {/* Avg Risk Score */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Risk Score</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-amber-400 font-mono">
            {analytics.metrics.avgRiskScore} / 100
          </p>
          <span className="text-[11px] text-slate-400">Portfolio telemetry index</span>
        </div>

        {/* Active Contract Ratio */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Ratio</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-indigo-300 font-mono">
            {analytics.metrics.activeContractRatio}%
          </p>
          <span className="text-[11px] text-emerald-400">Healthy operational status</span>
        </div>
      </div>

      {/* Row 2: Growth Trends & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Trend Area Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Data Growth Trends (Cumulative Volume)
              </h3>
            </div>
            <button
              onClick={() => refetch()}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.growthTrends}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="volume" stroke="#3b82f6" fillOpacity={1} fill="url(#growthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Category Distribution Bar Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-4 w-4 text-indigo-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Records by Industry Category
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.recordsByCategory} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={10} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "11px" }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Records by Status & Top Global Regions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
            Records by Status
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.recordsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {analytics.recordsByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "11px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Countries by Revenue Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Top Geographic Markets (Revenue Volume)
            </h3>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topCountries}>
                <XAxis dataKey="country" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "11px" }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="totalRevenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Search Engine Performance Telemetry */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-4 w-4 text-blue-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Search Strategy Performance & Query Latency Telemetry
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {analytics.searchActivity.length === 0 ? (
            <div className="col-span-3 text-center py-6 text-xs text-slate-400">
              Execute search queries in Data Explorer to populate live performance metrics.
            </div>
          ) : (
            analytics.searchActivity.map((act) => (
              <div
                key={act.method}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{act.method}</span>
                  <span className="rounded bg-blue-900/40 px-2 py-0.5 text-[10px] text-blue-400 font-mono">
                    {act.count} executions
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-[11px] text-slate-400">Average Latency:</span>
                  <span className="font-mono text-base font-bold text-emerald-400">
                    {act.avgTimeMs} ms
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
