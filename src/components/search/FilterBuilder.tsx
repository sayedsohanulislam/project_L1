"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addFilter,
  updateFilter,
  removeFilter,
  clearFilters,
} from "@/store/slices/searchConfigSlice";
import { FilterCondition } from "@/types";
import { Plus, X, Trash2, Filter } from "lucide-react";

const AVAILABLE_FILTER_FIELDS = [
  { key: "status", label: "Status", operators: ["equals", "not_equals"] },
  { key: "country", label: "Country", operators: ["equals", "not_equals", "contains"] },
  { key: "industry", label: "Industry", operators: ["equals", "not_equals", "contains"] },
  { key: "revenue", label: "Annual Revenue", operators: ["greater_than", "less_than", "equals"] },
  { key: "riskScore", label: "Risk Score", operators: ["greater_than", "less_than", "equals"] },
  { key: "contractTier", label: "Contract Tier", operators: ["equals", "not_equals"] },
  { key: "department", label: "Department", operators: ["equals", "contains"] },
  { key: "createdAt", label: "Created Date", operators: ["last_n_days"] },
];

const OPERATOR_LABELS: Record<string, string> = {
  equals: "Equals",
  not_equals: "Does Not Equal",
  contains: "Contains",
  greater_than: "Greater Than (>)",
  less_than: "Less Than (<)",
  last_n_days: "In Last (Days)",
};

export function FilterBuilder() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.searchConfig.filters);

  const handleAddNewCondition = () => {
    const newCond: FilterCondition = {
      id: `filter-${Date.now()}`,
      field: "status",
      operator: "equals",
      value: "Active",
    };
    dispatch(addFilter(newCond));
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Compound Filter Builder ({filters.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {filters.length > 0 && (
            <button
              onClick={() => dispatch(clearFilters())}
              className="flex items-center gap-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Clear All
            </button>
          )}
          <button
            onClick={handleAddNewCondition}
            className="flex items-center gap-1 rounded-md bg-blue-600/20 border border-blue-500/40 px-2.5 py-1 text-xs font-medium text-blue-300 hover:bg-blue-600/30 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Rule
          </button>
        </div>
      </div>

      {filters.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-800 p-4 text-center text-xs text-slate-400">
          No active compound filters. Click <span className="text-blue-400 font-medium">Add Rule</span> or use the search bar above to drill into the dataset.
        </div>
      ) : (
        <div className="space-y-2">
          {filters.map((f, idx) => {
            const fieldMeta = AVAILABLE_FILTER_FIELDS.find((item) => item.key === f.field) || AVAILABLE_FILTER_FIELDS[0];

            return (
              <div
                key={f.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-xs"
              >
                <span className="w-12 text-center text-[10px] font-bold text-slate-400 uppercase">
                  {idx === 0 ? "WHERE" : "AND"}
                </span>

                {/* Field Select */}
                <select
                  value={f.field}
                  onChange={(e) => {
                    const newField = e.target.value;
                    const meta = AVAILABLE_FILTER_FIELDS.find((m) => m.key === newField);
                    dispatch(
                      updateFilter({
                        id: f.id,
                        filter: {
                          field: newField,
                          operator: (meta?.operators[0] as any) || "equals",
                        },
                      })
                    );
                  }}
                  className="rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  {AVAILABLE_FILTER_FIELDS.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>

                {/* Operator Select */}
                <select
                  value={f.operator}
                  onChange={(e) =>
                    dispatch(
                      updateFilter({
                        id: f.id,
                        filter: { operator: e.target.value as any },
                      })
                    )
                  }
                  className="rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                >
                  {fieldMeta.operators.map((op) => (
                    <option key={op} value={op}>
                      {OPERATOR_LABELS[op] || op}
                    </option>
                  ))}
                </select>

                {/* Value Input */}
                <input
                  type={f.field === "revenue" || f.field === "riskScore" ? "number" : "text"}
                  value={f.value}
                  onChange={(e) =>
                    dispatch(
                      updateFilter({
                        id: f.id,
                        filter: { value: e.target.value },
                      })
                    )
                  }
                  placeholder="Enter target value..."
                  className="flex-1 min-w-[140px] rounded border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />

                {/* Remove Condition */}
                <button
                  onClick={() => dispatch(removeFilter(f.id))}
                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                  title="Remove condition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
