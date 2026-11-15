"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store";
import { useGetDatasetsQuery } from "@/store/services/api";
import { setActiveDatasetId, setActiveDataset } from "@/store/slices/datasetSlice";
import {
  Table,
  Database,
  BarChart3,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  Search,
} from "lucide-react";

export default function OverviewPage() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const activeDatasetId = useAppSelector((state) => state.dataset.activeDatasetId);
  const { data: datasets = [], isLoading } = useGetDatasetsQuery();

  useEffect(() => {
    if (datasets.length > 0 && !activeDatasetId) {
      dispatch(setActiveDatasetId(datasets[0].id));
      dispatch(setActiveDataset(datasets[0]));
    }
  }, [datasets, activeDatasetId, dispatch]);

  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-blue-900/40 bg-gradient-to-r from-blue-950/80 via-indigo-950/50 to-slate-950 p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Enterprise Data Discovery Platform • 100,000+ Record Benchmark Ready</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            DataScope Intelligence
          </h1>
          <p className="text-sm leading-relaxed text-slate-300">
            Engineered for high-volume enterprise data exploration, sub-100ms multi-condition queries,
            PostgreSQL trigram and full-text indexing, Redux Toolkit architecture, and instant analytical aggregations.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href="/explorer"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
            >
              <Table className="h-4 w-4" />
              <span>Launch Data Explorer</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/architecture"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-all"
            >
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>Technical Decisions (TDR)</span>
            </Link>

            <Link
              href="/benchmarks"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-all"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Run Benchmarks</span>
            </Link>
          </div>
        </div>

        {/* Decorative Grid Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Active Dataset Status Card */}
      {activeDataset && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-100">{activeDataset.name}</h2>
                  <span className="rounded bg-blue-900/50 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-800/60">
                    {activeDataset.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{activeDataset.description}</p>
              </div>
            </div>

            <Link
              href="/explorer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <span>Explore Records</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Total Scale</span>
              <p className="mt-1 font-mono text-lg font-bold text-white">
                {activeDataset.totalRecords.toLocaleString()} rows
              </p>
            </div>
            <div>
              <span className="text-slate-400">Data Source</span>
              <p className="mt-1 font-medium text-slate-200">{activeDataset.dataSource}</p>
            </div>
            <div>
              <span className="text-slate-400">Role Permissions</span>
              <p className="mt-1 font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                {auth.user?.role} (Full Access)
              </p>
            </div>
            <div>
              <span className="text-slate-400">Search Strategy</span>
              <p className="mt-1 font-medium text-blue-400">Full-Text + Trigram GIN</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Explorer Card */}
        <Link
          href="/explorer"
          className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-blue-500/50 hover:bg-slate-900/80 transition-all shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
            <Table className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-bold text-slate-100 group-hover:text-blue-400 transition-colors text-sm">
            Data Explorer Table
          </h3>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Multi-column sorting, column resizing, custom visibility, pagination, search term highlighting, and row inspector.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Open Explorer</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>

        {/* Analytics Card */}
        <Link
          href="/analytics"
          className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-bold text-slate-100 group-hover:text-indigo-400 transition-colors text-sm">
            Telemetry & Analytics
          </h3>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Interactive Recharts visualizations powered by SQL GROUP BY aggregations, growth velocity, and query metrics.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-indigo-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>View Analytics</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>

        {/* Search & Query Builder Card */}
        <Link
          href="/search"
          className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-6 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <Search className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-bold text-slate-100 group-hover:text-emerald-400 transition-colors text-sm">
            Visual Query Builder
          </h3>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Construct complex multi-condition queries with exact/partial matches, numerical ranges, date offsets, and AI synthesis.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-400 gap-1 group-hover:translate-x-1 transition-transform">
            <span>Build Queries</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>
      </div>
    </div>
  );
}
