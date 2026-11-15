"use client";

import React, { useState, useTransition } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  setPage,
  setPageSize,
  toggleColumnSort,
  setQuery,
  setSearchMethod,
} from "@/store/slices/searchConfigSlice";
import {
  toggleColumnVisibility,
  setTableDensity,
  toggleSelectRecord,
  selectAllRecords,
  clearSelection,
  setInspectorRecordId,
} from "@/store/slices/uiPreferenceSlice";
import { openSaveModal } from "@/store/slices/savedViewsSlice";
import { useGetRecordsQuery } from "@/store/services/api";
import { DatasetRecord } from "@/types";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Columns,
  Download,
  BookmarkPlus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Zap,
} from "lucide-react";

export function DataTable() {
  const dispatch = useAppDispatch();
  const [, startTransition] = useTransition();

  const activeDatasetId = useAppSelector((state) => state.dataset.activeDatasetId);
  const searchConfig = useAppSelector((state) => state.searchConfig);
  const ui = useAppSelector((state) => state.uiPreference);

  const [searchInput, setSearchInput] = useState(searchConfig.query);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // RTK Query hook fetching server-side paginated & filtered records
  const { data, isFetching, isLoading, refetch, error } = useGetRecordsQuery(
    {
      datasetId: activeDatasetId || "",
      query: searchConfig.query,
      searchMethod: searchConfig.searchMethod,
      filters: searchConfig.filters,
      sorting: searchConfig.sorting,
      page: searchConfig.page,
      pageSize: searchConfig.pageSize,
    },
    { skip: !activeDatasetId }
  );

  const records = data?.data || [];
  const pagination = data?.pagination;
  const metrics = data?.metrics;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      dispatch(setQuery(searchInput));
    });
  };

  const handleSort = (column: string, e: React.MouseEvent) => {
    dispatch(toggleColumnSort({ column, multi: e.shiftKey }));
  };

  const handleSelectAll = () => {
    if (ui.selectedRecordIds.length === records.length && records.length > 0) {
      dispatch(clearSelection());
    } else {
      dispatch(selectAllRecords(records.map((r) => r.id)));
    }
  };

  const handleExportCsv = async () => {
    if (!activeDatasetId) return;
    setIsExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId: activeDatasetId,
          query: searchConfig.query,
          filters: searchConfig.filters,
          sorting: searchConfig.sorting,
        }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `datascope-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Helper for text highlighting
  const renderHighlighted = (text: string | number) => {
    const str = String(text ?? "");
    if (!searchConfig.highlightMatches || !searchConfig.query.trim()) {
      return str;
    }
    const q = searchConfig.query.trim();
    const parts = str.split(new RegExp(`(${q})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <mark
              key={i}
              className="bg-yellow-400/30 text-yellow-200 font-semibold rounded px-0.5"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const getSortIcon = (colKey: string) => {
    const sort = searchConfig.sorting.find((s) => s.column === colKey);
    if (!sort) return <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-60" />;
    return sort.direction === "asc" ? (
      <ArrowUp className="h-3 w-3 text-blue-400" />
    ) : (
      <ArrowDown className="h-3 w-3 text-blue-400" />
    );
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-950/70 shadow-2xl backdrop-blur">
      {/* 1. Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 p-4">
        {/* Search Bar + Method Selector */}
        <div className="flex flex-1 items-center gap-2 max-w-xl">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by company, email, industry... (Enter to query)"
              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-1.5 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </form>

          {/* Search Method Dropdown */}
          <select
            value={searchConfig.searchMethod}
            onChange={(e) =>
              dispatch(
                setSearchMethod(e.target.value as "FULL_TEXT" | "TRIGRAM" | "EXACT")
              )
            }
            className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 focus:border-blue-500 focus:outline-none cursor-pointer"
            title="Database Search Strategy"
          >
            <option value="FULL_TEXT">PG Full-Text (tsvector)</option>
            <option value="TRIGRAM">PG Trigram (pg_trgm)</option>
            <option value="EXACT">Exact / Substring</option>
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Performance & Execution time badge */}
          {metrics && (
            <div
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${
                metrics.cached
                  ? "border-emerald-800/60 bg-emerald-950/40 text-emerald-300"
                  : "border-blue-800/60 bg-blue-950/40 text-blue-300"
              }`}
            >
              <Zap className="h-3 w-3 shrink-0" />
              <span>{metrics.queryTimeMs} ms</span>
              {metrics.cached && <span className="text-[9px] uppercase tracking-wider font-bold">(CACHED)</span>}
            </div>
          )}

          {/* Density Picker */}
          <div className="hidden sm:flex items-center rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs">
            {(["compact", "standard", "comfortable"] as const).map((density) => (
              <button
                key={density}
                onClick={() => dispatch(setTableDensity(density))}
                className={`rounded px-2 py-1 text-[10px] font-medium capitalize transition-colors ${
                  ui.tableDensity === density
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {density}
              </button>
            ))}
          </div>

          {/* Column Visibility Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <Columns className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden md:inline">Columns</span>
            </button>

            {showColumnDropdown && (
              <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-2xl backdrop-blur">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Toggle Columns
                </p>
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {Object.entries(ui.visibleColumns).map(([colKey, isVisible]) => (
                    <label
                      key={colKey}
                      className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white"
                    >
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => dispatch(toggleColumnVisibility(colKey))}
                        className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
                      />
                      <span className="capitalize">{colKey.replace(/([A-Z])/g, " $1")}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Save View Modal Trigger */}
          <button
            onClick={() => dispatch(openSaveModal())}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            title="Save current filters, search & sorting as a view"
          >
            <BookmarkPlus className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">Save View</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-colors"
            title="Stream Filtered Records to CSV"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden md:inline">{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>

          {/* Refetch */}
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-slate-800 bg-slate-900 p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Refresh records"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Selection Bar (if items selected) */}
      {ui.selectedRecordIds.length > 0 && (
        <div className="flex items-center justify-between bg-blue-950/40 px-4 py-2 border-b border-blue-900/40 text-xs">
          <div className="flex items-center gap-2 text-blue-300">
            <CheckSquare className="h-4 w-4 text-blue-400" />
            <span>
              <strong>{ui.selectedRecordIds.length}</strong> record{ui.selectedRecordIds.length > 1 ? "s" : ""} selected
            </span>
          </div>
          <button
            onClick={() => dispatch(clearSelection())}
            className="text-xs text-blue-400 hover:underline"
          >
            Deselect all
          </button>
        </div>
      )}

      {/* 3. Table Container */}
      <div className="relative overflow-x-auto min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400 space-y-3">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-xs font-medium">Executing high-performance query on 100,000+ records...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-400 text-xs">
            <p className="font-semibold text-sm">Failed to load records</p>
            <p className="text-slate-400 mt-1">Please ensure PostgreSQL database is seeded and running.</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-xs space-y-2">
            <SlidersHorizontal className="h-8 w-8 mx-auto text-slate-400 opacity-60" />
            <p className="text-sm font-semibold text-slate-300">No records found matching query</p>
            <p className="text-slate-400">Try modifying your compound search filters or clearing the search text.</p>
          </div>
        ) : (
          <table
            className={`w-full text-left border-collapse ${
              ui.tableDensity === "compact"
                ? "table-compact"
                : ui.tableDensity === "comfortable"
                ? "table-comfortable"
                : "table-standard"
            }`}
          >
            <thead className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/95 backdrop-blur text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                {/* Select All Checkbox */}
                <th className="w-10 text-center">
                  <button onClick={handleSelectAll} className="align-middle">
                    {ui.selectedRecordIds.length === records.length && records.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </th>

                {ui.visibleColumns.recordNumber && (
                  <th
                    onClick={(e) => handleSort("recordNumber", e)}
                    className="cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>#</span>
                      {getSortIcon("recordNumber")}
                    </div>
                  </th>
                )}

                {ui.visibleColumns.companyName && (
                  <th
                    onClick={(e) => handleSort("companyName", e)}
                    className="cursor-pointer hover:text-white transition-colors min-w-[200px]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Company Name</span>
                      {getSortIcon("companyName")}
                    </div>
                  </th>
                )}

                {ui.visibleColumns.status && (
                  <th
                    onClick={(e) => handleSort("status", e)}
                    className="cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      {getSortIcon("status")}
                    </div>
                  </th>
                )}

                {ui.visibleColumns.country && (
                  <th
                    onClick={(e) => handleSort("country", e)}
                    className="cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Country</span>
                      {getSortIcon("country")}
                    </div>
                  </th>
                )}

                {ui.visibleColumns.industry && (
                  <th
                    onClick={(e) => handleSort("industry", e)}
                    className="cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Industry</span>
                      {getSortIcon("industry")}
                    </div>
                  </th>
                )}

                {ui.visibleColumns.revenue && (
                  <th
                    onClick={(e) => handleSort("revenue", e)}
                    className="cursor-pointer hover:text-white transition-colors text-right"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Revenue</span>
                      {getSortIcon("revenue")}
                    </div>
                  </th>
                )}

                {ui.visibleColumns.riskScore && (
                  <th
                    onClick={(e) => handleSort("riskScore", e)}
                    className="cursor-pointer hover:text-white transition-colors text-center"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Risk</span>
                      {getSortIcon("riskScore")}
                    </div>
                  </th>
                )}

                {ui.visibleColumns.contractTier && (
                  <th
                    onClick={(e) => handleSort("contractTier", e)}
                    className="cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Tier</span>
                      {getSortIcon("contractTier")}
                    </div>
                  </th>
                )}

                {ui.visibleColumns.department && (
                  <th
                    onClick={(e) => handleSort("department", e)}
                    className="cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Department</span>
                      {getSortIcon("department")}
                    </div>
                  </th>
                )}

                {ui.visibleColumns.contactEmail && (
                  <th className="min-w-[180px]">Contact Email</th>
                )}

                {ui.visibleColumns.createdAt && (
                  <th
                    onClick={(e) => handleSort("createdAt", e)}
                    className="cursor-pointer hover:text-white transition-colors text-right"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Created</span>
                      {getSortIcon("createdAt")}
                    </div>
                  </th>
                )}

                <th className="text-center w-12">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {records.map((rec) => {
                const isSelected = ui.selectedRecordIds.includes(rec.id);

                return (
                  <tr
                    key={rec.id}
                    className={`transition-colors hover:bg-slate-900/80 cursor-pointer ${
                      isSelected ? "bg-blue-950/20" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td
                      className="text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(toggleSelectRecord(rec.id));
                      }}
                    >
                      <button className="align-middle">
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </td>

                    {/* Record Number */}
                    {ui.visibleColumns.recordNumber && (
                      <td className="text-slate-400 text-xs">
                        #{rec.recordNumber}
                      </td>
                    )}

                    {/* Company Name */}
                    {ui.visibleColumns.companyName && (
                      <td
                        className="font-medium font-sans text-slate-100 hover:text-blue-400 transition-colors"
                        onClick={() => dispatch(setInspectorRecordId(rec.id))}
                      >
                        {renderHighlighted(rec.companyName)}
                      </td>
                    )}

                    {/* Status Pill */}
                    {ui.visibleColumns.status && (
                      <td>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider font-sans ${
                            rec.status === "Active"
                              ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/50"
                              : rec.status === "Pending"
                              ? "bg-amber-950/70 text-amber-400 border border-amber-800/50"
                              : rec.status === "Archived"
                              ? "bg-slate-800/70 text-slate-400 border border-slate-700/50"
                              : "bg-rose-950/70 text-rose-400 border border-rose-800/50"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                    )}

                    {/* Country */}
                    {ui.visibleColumns.country && (
                      <td className="font-sans text-xs text-slate-300">
                        {renderHighlighted(rec.country)}
                      </td>
                    )}

                    {/* Industry */}
                    {ui.visibleColumns.industry && (
                      <td className="font-sans text-xs text-slate-400">
                        {renderHighlighted(rec.industry)}
                      </td>
                    )}

                    {/* Revenue */}
                    {ui.visibleColumns.revenue && (
                      <td className="text-right text-xs font-semibold text-emerald-400">
                        ${Number(rec.revenue).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                    )}

                    {/* Risk Score */}
                    {ui.visibleColumns.riskScore && (
                      <td className="text-center text-xs">
                        <span
                          className={`font-semibold ${
                            Number(rec.riskScore) > 70
                              ? "text-rose-400"
                              : Number(rec.riskScore) > 40
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {Number(rec.riskScore).toFixed(1)}
                        </span>
                      </td>
                    )}

                    {/* Contract Tier */}
                    {ui.visibleColumns.contractTier && (
                      <td className="font-sans text-xs text-slate-300">
                        {rec.contractTier}
                      </td>
                    )}

                    {/* Department */}
                    {ui.visibleColumns.department && (
                      <td className="font-sans text-xs text-slate-400">
                        {rec.department}
                      </td>
                    )}

                    {/* Contact Email */}
                    {ui.visibleColumns.contactEmail && (
                      <td className="text-xs text-slate-400 truncate">
                        {renderHighlighted(rec.contactEmail)}
                      </td>
                    )}

                    {/* Created At */}
                    {ui.visibleColumns.createdAt && (
                      <td className="text-right text-[11px] text-slate-400">
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </td>
                    )}

                    {/* Inspector Trigger */}
                    <td className="text-center">
                      <button
                        onClick={() => dispatch(setInspectorRecordId(rec.id))}
                        className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-blue-400 transition-colors"
                        title="Inspect record details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 4. Server-Side Pagination Bar */}
      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 px-4 py-3 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              Showing{" "}
              <strong className="text-slate-200">
                {records.length > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-200">
                {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}
              </strong>{" "}
              of <strong className="text-slate-200">{pagination.totalCount.toLocaleString()}</strong> records
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-3">
              <span>Rows per page:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
                className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Page Navigation & Jump to page */}
          <div className="flex items-center gap-2">
            <span className="mr-2">
              Page <strong className="text-slate-200">{pagination.page}</strong> of{" "}
              <strong className="text-slate-200">{pagination.totalPages || 1}</strong>
            </span>

            <button
              onClick={() => dispatch(setPage(1))}
              disabled={pagination.page <= 1}
              className="rounded border border-slate-800 bg-slate-900 p-1 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors"
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => dispatch(setPage(pagination.page - 1))}
              disabled={!pagination.hasPrevPage}
              className="rounded border border-slate-800 bg-slate-900 p-1 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => dispatch(setPage(pagination.page + 1))}
              disabled={!pagination.hasNextPage}
              className="rounded border border-slate-800 bg-slate-900 p-1 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => dispatch(setPage(pagination.totalPages))}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded border border-slate-800 bg-slate-900 p-1 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors"
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
