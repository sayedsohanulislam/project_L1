"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { setInspectorRecordId } from "@/store/slices/uiPreferenceSlice";
import { useGetRecordDetailsQuery } from "@/store/services/api";
import {
  X,
  Building2,
  Calendar,
  Layers,
  History,
  FileCode,
  DollarSign,
  AlertTriangle,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";

export function RecordInspector() {
  const dispatch = useAppDispatch();
  const inspectorRecordId = useAppSelector(
    (state) => state.uiPreference.inspectorRecordId
  );
  const activeDatasetId = useAppSelector(
    (state) => state.dataset.activeDatasetId
  );

  const [activeTab, setActiveTab] = useState<"details" | "related" | "history" | "raw">("details");

  const { data, isLoading } = useGetRecordDetailsQuery(
    { datasetId: activeDatasetId || "", recordId: inspectorRecordId || "" },
    { skip: !inspectorRecordId || !activeDatasetId }
  );

  if (!inspectorRecordId) return null;

  const record = data?.record;
  const relationships = data?.relationships || [];
  const historicalChanges = data?.historicalChanges || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="flex h-full w-full max-w-2xl flex-col border-l border-slate-800 bg-slate-950 p-6 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  {record ? record.companyName : "Loading Record..."}
                </h2>
                {record && (
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-300">
                    #{record.recordNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{record?.industry} • {record?.country}</p>
            </div>
          </div>

          <button
            onClick={() => dispatch(setInspectorRecordId(null))}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 mt-4 space-x-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 transition-colors ${
              activeTab === "details"
                ? "border-b-2 border-blue-500 text-blue-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Record Details
          </button>
          <button
            onClick={() => setActiveTab("related")}
            className={`pb-3 transition-colors flex items-center gap-1.5 ${
              activeTab === "related"
                ? "border-b-2 border-blue-500 text-blue-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Related Records</span>
            <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[10px]">{relationships.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 transition-colors flex items-center gap-1.5 ${
              activeTab === "history"
                ? "border-b-2 border-blue-500 text-blue-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Audit History</span>
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`pb-3 transition-colors flex items-center gap-1.5 ${
              activeTab === "raw"
                ? "border-b-2 border-blue-500 text-blue-400 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span>Raw JSON</span>
          </button>
        </div>

        {/* Tab Body */}
        {isLoading || !record ? (
          <div className="flex flex-1 items-center justify-center p-12 text-xs text-slate-400">
            Loading record attributes and relations...
          </div>
        ) : (
          <div className="flex-1 py-6 space-y-6">
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                      Annual Revenue
                    </span>
                    <p className="mt-1 text-sm font-bold text-emerald-400">
                      ${Number(record.revenue).toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                      Risk Score
                    </span>
                    <p className="mt-1 text-sm font-bold text-amber-400">
                      {record.riskScore} / 100
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-indigo-400" />
                      Contract Tier
                    </span>
                    <p className="mt-1 text-sm font-bold text-indigo-300">
                      {record.contractTier}
                    </p>
                  </div>
                </div>

                {/* Field Details Grid */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Core Attributes
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Status</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{record.status}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Department</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{record.department}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" /> Contact Email
                      </span>
                      <p className="font-mono text-slate-200 mt-0.5">{record.contactEmail}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" /> Country & Region
                      </span>
                      <p className="font-semibold text-slate-200 mt-0.5">
                        {record.country} ({String((record.data as any)?.primaryRegion || "Global")})
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" /> Created Date
                      </span>
                      <p className="text-slate-300 mt-0.5">
                        {new Date(record.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" /> Last Updated
                      </span>
                      <p className="text-slate-300 mt-0.5">
                        {new Date(record.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* JSON Telemetry Data */}
                {record.data && Object.keys(record.data).length > 0 && (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Enterprise Telemetry Metadata
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(record.data).map(([k, v]) => (
                        <div key={k} className="rounded bg-slate-950/60 p-2 border border-slate-800/60">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {k.replace(/([A-Z])/g, " $1")}
                          </span>
                          <p className="font-medium text-slate-200 mt-0.5">{String(v)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Related Records Tab */}
            {activeTab === "related" && (
              <div className="space-y-3">
                {relationships.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No related subsidiary or cross-sell accounts linked.
                  </div>
                ) : (
                  relationships.map((rel) => (
                    <div
                      key={rel.id}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3 hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <span className="rounded bg-blue-900/40 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-800/50">
                          {rel.relationshipType}
                        </span>
                        <p className="font-semibold text-xs text-slate-200 mt-1">
                          {rel.companyName || "Affiliated Partner Account"}
                        </p>
                        <p className="text-[11px] text-slate-400">Status: {rel.status}</p>
                      </div>

                      <button
                        onClick={() => dispatch(setInspectorRecordId(rel.relatedRecordId || rel.targetRecordId))}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                      >
                        Inspect <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Audit History Tab */}
            {activeTab === "history" && (
              <div className="space-y-3">
                <div className="border-l-2 border-blue-500 pl-4 space-y-4">
                  {historicalChanges.map((change, idx) => (
                    <div key={idx} className="relative text-xs">
                      <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-blue-500" />
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Field modified: <strong className="text-slate-200">{change.field}</strong></span>
                        <span>{new Date(change.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-1 rounded bg-slate-900 p-2 text-xs border border-slate-800">
                        <span className="text-rose-400 line-through mr-2">{String(change.oldValue)}</span>
                        <span className="text-emerald-400 font-medium">➔ {String(change.newValue)}</span>
                        <p className="text-[10px] text-slate-400 mt-1">by {change.changedBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON */}
            {activeTab === "raw" && (
              <pre className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                {JSON.stringify(record, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
