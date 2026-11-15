"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { switchRole } from "@/store/slices/authSlice";
import {
  useGetDatasetsQuery,
  useParseNaturalQueryMutation,
} from "@/store/services/api";
import { setActiveDatasetId, setActiveDataset } from "@/store/slices/datasetSlice";
import { applySavedConfig } from "@/store/slices/searchConfigSlice";
import {
  Database,
  Shield,
  Sparkles,
  Search,
  CheckCircle2,
  ChevronDown,
  Layers,
  Activity,
} from "lucide-react";

export function Header() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const activeDatasetId = useAppSelector((state) => state.dataset.activeDatasetId);
  const { data: datasets = [] } = useGetDatasetsQuery();

  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [parseNaturalQuery] = useParseNaturalQueryMutation();

  const handleDatasetChange = (id: string) => {
    dispatch(setActiveDatasetId(id));
    const found = datasets.find((d) => d.id === id);
    if (found) dispatch(setActiveDataset(found));
  };

  const handleRoleChange = (role: "ADMIN" | "DATA_ANALYST" | "VIEWER") => {
    dispatch(switchRole(role));
  };

  const handleAiSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || !activeDatasetId) return;

    setIsAiLoading(true);
    setAiFeedback(null);
    try {
      const res = await parseNaturalQuery({
        naturalQuery: aiPrompt,
        datasetId: activeDatasetId,
      }).unwrap();

      dispatch(
        applySavedConfig({
          query: res.query,
          filters: res.filters,
          sorting: res.sorting,
        })
      );
      setAiFeedback(res.explanation);
      setTimeout(() => setAiFeedback(null), 6000);
    } catch {
      setAiFeedback("Failed to parse query.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 backdrop-blur-md">
      {/* Left: Brand & Dataset Selector */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-500/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white">DataScope</span>
              <span className="rounded bg-blue-900/50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-blue-400 border border-blue-800/60">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Data Discovery & Intelligence</p>
          </div>
        </div>

        {/* Dataset Quick Dropdown */}
        <div className="hidden lg:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5">
          <Database className="h-4 w-4 text-blue-400" />
          <span className="text-xs text-slate-400">Dataset:</span>
          <select
            value={activeDatasetId || ""}
            onChange={(e) => handleDatasetChange(e.target.value)}
            className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id} className="bg-slate-900 text-slate-200">
                {d.name} ({d.totalRecords.toLocaleString()} rows)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle: Natural Language AI Search Quick Bar */}
      <div className="relative hidden md:flex items-center max-w-md w-full mx-4">
        <form onSubmit={handleAiSearchSubmit} className="relative w-full">
          <Sparkles className="absolute left-3 top-2.5 h-4 w-4 text-amber-400 animate-pulse" />
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask AI: 'Active customers from Germany with revenue > $10,000'..."
            className="w-full rounded-full border border-slate-800 bg-slate-900/90 py-1.5 pl-9 pr-20 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={isAiLoading || !aiPrompt.trim()}
            className="absolute right-1.5 top-1 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-500 disabled:opacity-40 transition-colors"
          >
            {isAiLoading ? "Parsing..." : "Apply"}
          </button>
        </form>

        {aiFeedback && (
          <div className="absolute top-11 left-0 right-0 rounded-lg border border-emerald-500/40 bg-slate-900/95 p-2 shadow-xl text-xs text-emerald-400 backdrop-blur z-50 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{aiFeedback}</span>
          </div>
        )}
      </div>

      {/* Right: Role Switcher & User Profile */}
      <div className="flex items-center gap-4">
        {/* Role Switcher Pill */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2 py-1">
          <Shield className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-[11px] text-slate-400">Role:</span>
          <select
            value={auth.user?.role || "DATA_ANALYST"}
            onChange={(e) =>
              handleRoleChange(e.target.value as "ADMIN" | "DATA_ANALYST" | "VIEWER")
            }
            className="bg-transparent text-xs font-semibold text-indigo-300 focus:outline-none cursor-pointer"
          >
            <option value="ADMIN" className="bg-slate-900 text-slate-200">
              Admin
            </option>
            <option value="DATA_ANALYST" className="bg-slate-900 text-slate-200">
              Data Analyst
            </option>
            <option value="VIEWER" className="bg-slate-900 text-slate-200">
              Viewer
            </option>
          </select>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2.5 border-l border-slate-800 pl-4">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow">
              {auth.user?.name ? auth.user.name.charAt(0) : "U"}
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-slate-200 leading-tight">
              {auth.user?.name}
            </p>
            <p className="text-[10px] text-slate-400 leading-none">
              {auth.user?.role}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
