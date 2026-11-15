"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setTableDensity,
  resetColumns,
  toggleVirtualization,
} from "@/store/slices/uiPreferenceSlice";
import { switchRole } from "@/store/slices/authSlice";
import {
  Settings,
  Shield,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Monitor,
} from "lucide-react";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const ui = useAppSelector((state) => state.uiPreference);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-500" />
          <h1 className="text-xl font-bold tracking-tight text-white">
            Platform Settings & User Preferences
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Customize UI layout density, active role persona, and caching parameters.
        </p>
      </div>

      {/* Role Management */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100">Role-Based Access Control Persona</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Switch active user role to verify granular permissions, read/write/delete checks, and UI affordances.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["ADMIN", "DATA_ANALYST", "VIEWER"] as const).map((r) => (
            <button
              key={r}
              onClick={() => dispatch(switchRole(r))}
              className={`rounded-xl border p-4 text-left transition-all ${
                auth.user?.role === r
                  ? "border-blue-500 bg-blue-950/40 text-blue-200"
                  : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs capitalize">{r.replace("_", " ")}</span>
                {auth.user?.role === r && (
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {r === "ADMIN"
                  ? "Full access to dataset configuration, permissions & system schemas."
                  : r === "DATA_ANALYST"
                  ? "Advanced search, custom query building, views, and CSV exports."
                  : "Read-only access to authorized views and search tools."}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Table & Display Preferences */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-bold text-slate-100">Data Table Rendering Density</h3>
        </div>

        <div className="flex gap-3">
          {(["compact", "standard", "comfortable"] as const).map((d) => (
            <button
              key={d}
              onClick={() => dispatch(setTableDensity(d))}
              className={`rounded-xl border px-4 py-2.5 text-xs font-semibold capitalize transition-all ${
                ui.tableDensity === d
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Column Preferences Reset */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Reset Column Configuration</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Restore all hidden columns and reset widths back to factory default.
          </p>
        </div>

        <button
          onClick={() => dispatch(resetColumns())}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset Defaults</span>
        </button>
      </div>
    </div>
  );
}
