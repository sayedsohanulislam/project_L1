"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useGetDatasetsQuery } from "@/store/services/api";
import { setActiveDatasetId, setActiveDataset } from "@/store/slices/datasetSlice";
import { applySavedConfig } from "@/store/slices/searchConfigSlice";
import { DataTable } from "@/components/explorer/DataTable";
import { FilterBuilder } from "@/components/search/FilterBuilder";
import {
  Table,
  Sliders,
  Sparkles,
  BookmarkCheck,
  CheckCircle2,
} from "lucide-react";

export default function ExplorerPage() {
  const dispatch = useAppDispatch();
  const activeDatasetId = useAppSelector((state) => state.dataset.activeDatasetId);
  const { data: datasets = [] } = useGetDatasetsQuery();

  useEffect(() => {
    if (datasets.length > 0 && !activeDatasetId) {
      dispatch(setActiveDatasetId(datasets[0].id));
      dispatch(setActiveDataset(datasets[0]));
    }
  }, [datasets, activeDatasetId, dispatch]);

  const activeDataset = datasets.find((d) => d.id === activeDatasetId) || datasets[0];

  // Preset query specifically cited in Section 3.C of assignment
  const applyAssignmentExamplePreset = () => {
    dispatch(
      applySavedConfig({
        query: "",
        filters: [
          { id: "p-1", field: "status", operator: "equals", value: "Active" },
          { id: "p-2", field: "country", operator: "equals", value: "Germany" },
          { id: "p-3", field: "revenue", operator: "greater_than", value: "10000" },
          { id: "p-4", field: "createdAt", operator: "last_n_days", value: "30" },
        ],
        sorting: [{ column: "revenue", direction: "desc" }],
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Table className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              Data Explorer
            </h1>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-300">
              {activeDataset ? `${activeDataset.totalRecords.toLocaleString()} rows` : "Loading..."}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse, filter, sort, and inspect records with server-side pagination & GIN index acceleration.
          </p>
        </div>

        {/* Quick Assignment Preset Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={applyAssignmentExamplePreset}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/40 px-3.5 py-2 text-xs font-medium text-indigo-300 hover:bg-indigo-900/40 transition-colors shadow-sm"
            title="Load Section 3.C Specification Preset: Status=Active, Country=Germany, Revenue>$10k, Last 30 Days"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Apply Spec Demo Preset (Germany Active &gt; $10k)</span>
          </button>
        </div>
      </div>

      {/* Compound Filter Builder */}
      <FilterBuilder />

      {/* Main Data Table */}
      <DataTable />
    </div>
  );
}
