"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setQuery,
  setSearchMethod,
  addFilter,
  clearFilters,
  applySavedConfig,
} from "@/store/slices/searchConfigSlice";
import { FilterBuilder } from "@/components/search/FilterBuilder";
import { DataTable } from "@/components/explorer/DataTable";
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  Code2,
  Terminal,
  Zap,
} from "lucide-react";

export default function AdvancedSearchPage() {
  const dispatch = useAppDispatch();
  const searchConfig = useAppSelector((state) => state.searchConfig);
  const activeDatasetId = useAppSelector((state) => state.dataset.activeDatasetId);

  // Natural language query input state
  const [nlInput, setNlInput] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslateNl = async () => {
    if (!nlInput.trim() || !activeDatasetId) return;
    setIsTranslating(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naturalQuery: nlInput, datasetId: activeDatasetId }),
      });
      const data = await res.json();
      if (data.filters) {
        dispatch(
          applySavedConfig({
            query: data.query,
            filters: data.filters,
            sorting: data.sorting,
          })
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Generate equivalent SQL string for the visual conditions
  const generateSqlPreview = () => {
    let sql = `SELECT * FROM dataset_records\nWHERE dataset_id = '${activeDatasetId}'`;
    if (searchConfig.query) {
      sql += `\n  AND (company_name ILIKE '%${searchConfig.query}%' OR to_tsvector(company_name) @@ to_tsquery('${searchConfig.query}'))`;
    }
    for (const f of searchConfig.filters) {
      if (f.operator === "equals") sql += `\n  AND ${f.field} = '${f.value}'`;
      else if (f.operator === "greater_than") sql += `\n  AND ${f.field} > ${f.value}`;
      else if (f.operator === "less_than") sql += `\n  AND ${f.field} < ${f.value}`;
      else if (f.operator === "contains") sql += `\n  AND ${f.field} ILIKE '%${f.value}%'`;
      else if (f.operator === "last_n_days") sql += `\n  AND created_at >= NOW() - INTERVAL '${f.value} days'`;
    }
    if (searchConfig.sorting.length > 0) {
      sql += `\nORDER BY ${searchConfig.sorting.map((s) => `${s.column} ${s.direction.toUpperCase()}`).join(", ")}`;
    }
    sql += `\nLIMIT ${searchConfig.pageSize} OFFSET ${(searchConfig.page - 1) * searchConfig.pageSize};`;
    return sql;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-6 w-6 text-blue-500" />
          <h1 className="text-xl font-bold tracking-tight text-white">
            Advanced Search & Visual Query Engine
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Combine multi-column relational filters, numeric and date boundary queries, full-text ranking, and trigram indexing.
        </p>
      </div>

      {/* AI Natural Language Query Assistant */}
      <div className="rounded-2xl border border-indigo-900/40 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-950 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
            AI Natural Language Query Assistant (Bonus Challenge 17.E)
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Describe what you want to query in plain English (e.g. &quot;Find active customers from Germany with revenue greater than $10,000&quot;).
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            placeholder="e.g. Find active customers from Germany with revenue greater than $10,000"
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <button
            onClick={handleTranslateNl}
            disabled={isTranslating || !nlInput.trim()}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
          >
            {isTranslating ? "Translating..." : "Translate & Apply"}
          </button>
        </div>
      </div>

      {/* Visual Compound Filter Builder */}
      <FilterBuilder />

      {/* SQL Query Translation Preview */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            Server-Side Generated SQL AST Preview
          </span>
        </div>
        <pre className="text-emerald-400/90 overflow-x-auto leading-relaxed p-2 rounded bg-slate-900/50">
          {generateSqlPreview()}
        </pre>
      </div>

      {/* Results DataTable */}
      <DataTable />
    </div>
  );
}
