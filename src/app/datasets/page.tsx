"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useGetDatasetsQuery } from "@/store/services/api";
import { setActiveDatasetId, setActiveDataset } from "@/store/slices/datasetSlice";
import {
  Database,
  Plus,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";

export default function DatasetsPage() {
  const dispatch = useAppDispatch();
  const activeDatasetId = useAppSelector((state) => state.dataset.activeDatasetId);
  const user = useAppSelector((state) => state.auth.user);
  const { data: datasets = [], isLoading, refetch } = useGetDatasetsQuery();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDataset, setNewDataset] = useState({
    name: "",
    description: "",
    category: "Operations",
    dataSource: "Custom Ingest Pipeline",
  });

  const isAdmin = user?.role === "ADMIN";

  const handleSelect = (d: any) => {
    dispatch(setActiveDatasetId(d.id));
    dispatch(setActiveDataset(d));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              Dataset Library & Governance
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage enterprise data sources, record schemas, and role-based permissions.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Dataset</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading datasets...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {datasets.map((dataset) => {
            const isActive = dataset.id === activeDatasetId;

            return (
              <div
                key={dataset.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                  isActive
                    ? "border-blue-500/60 bg-blue-950/20 shadow-lg shadow-blue-950/50"
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-sm">{dataset.name}</h3>
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                          {dataset.category}
                        </span>
                      </div>
                    </div>

                    {isActive && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800/60">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                    {dataset.description || "No description provided."}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t border-slate-800/60 pt-3">
                    <div>
                      <span className="text-[11px] text-slate-400">Source:</span>
                      <p className="font-medium text-slate-200">{dataset.dataSource}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Record Volume:</span>
                      <p className="font-mono font-bold text-white">
                        {dataset.totalRecords.toLocaleString()} rows
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Created:</span>
                      <p className="text-slate-300">
                        {new Date(dataset.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Permissions:</span>
                      <p className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Read / Write
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleSelect(dataset)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {isActive ? "Currently Selected" : "Set as Active"}
                  </button>

                  <Link
                    href="/explorer"
                    className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
                  >
                    <span>View in Explorer</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Creating Datasets (Admin only) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100">Create New Dataset</h3>
            <p className="text-xs text-slate-400 mt-1">Configure metadata and partition keys.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowCreateModal(false);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 mb-1">Dataset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Healthcare Claims Registry"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Healthcare / Compliance"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Data Source</label>
                <input
                  type="text"
                  placeholder="e.g. Snowflake / S3 Parquet"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-slate-800 px-3 py-1.5 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 font-medium text-white hover:bg-blue-500"
                >
                  Save Dataset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
