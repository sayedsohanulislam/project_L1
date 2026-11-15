"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useGetSearchHistoryQuery } from "@/store/services/api";
import { setQuery, setSearchMethod } from "@/store/slices/searchConfigSlice";
import { useRouter } from "next/navigation";
import {
  History,
  Clock,
  Search,
  Zap,
  ArrowRight,
  Database,
  BarChart,
  Terminal,
} from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeDatasetId = useAppSelector((state) => state.dataset.activeDatasetId);
  const { data: history = [], isLoading } = useGetSearchHistoryQuery(
    activeDatasetId || "",
    { skip: !activeDatasetId }
  );

  const handleReplayQuery = (entry: any) => {
    if (entry.queryText && entry.queryText !== "(Filtered view)") {
      dispatch(setQuery(entry.queryText));
    }
    if (entry.searchMethod) {
      dispatch(setSearchMethod(entry.searchMethod));
    }
    router.push("/explorer");
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-blue-500" />
          <h1 className="text-xl font-bold tracking-tight text-white">
            Search History & Performance Audit Log
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Historical query audit trail capturing response times, matched record counts, and database execution plans.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading audit history...</div>
      ) : history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-xs text-slate-400">
          No executed queries logged yet. Search across the Data Explorer to automatically populate the audit log.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-2xl backdrop-blur">
          <div className="p-4 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Recent Executions ({history.length})
          </div>
          <div className="divide-y divide-slate-800/60 font-mono text-xs">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-slate-900/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-sans font-semibold text-slate-200">
                      <span>{entry.queryText || "(Unfiltered Search)"}</span>
                      <span className="rounded bg-blue-900/40 px-2 py-0.5 text-[10px] font-mono text-blue-400 border border-blue-800/40">
                        {entry.searchMethod}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Yielded {entry.resultsCount.toLocaleString()} matching records
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Execution time pill */}
                  <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] text-emerald-400">
                    <Zap className="h-3 w-3" />
                    <span>{Number(entry.executionTimeMs).toFixed(1)} ms</span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {new Date(entry.createdAt).toLocaleTimeString()}
                  </span>

                  <button
                    onClick={() => handleReplayQuery(entry)}
                    className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-sans font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    <span>Replay</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
