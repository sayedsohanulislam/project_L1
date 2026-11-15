"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  useGetSavedViewsQuery,
  useDeleteSavedViewMutation,
} from "@/store/services/api";
import { applySavedConfig } from "@/store/slices/searchConfigSlice";
import { openSaveModal } from "@/store/slices/savedViewsSlice";
import {
  BookmarkCheck,
  BookmarkPlus,
  Play,
  Trash2,
  Share2,
  Calendar,
  Layers,
  Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SavedViewsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeDatasetId = useAppSelector((state) => state.dataset.activeDatasetId);

  const { data: views = [], isLoading } = useGetSavedViewsQuery(
    activeDatasetId || "",
    { skip: !activeDatasetId }
  );

  const [deleteSavedView] = useDeleteSavedViewMutation();

  const handleApplyView = (v: any) => {
    dispatch(
      applySavedConfig({
        query: v.searchConditions?.query || "",
        filters: v.filters || [],
        sorting: v.sortingConfig || [],
      })
    );
    router.push("/explorer");
  };

  const handleDelete = async (id: string) => {
    if (!activeDatasetId) return;
    try {
      await deleteSavedView({ datasetId: activeDatasetId, id }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookmarkCheck className="h-6 w-6 text-amber-500" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              Saved Views & Shared Perspectives
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Persist complex search queries, compound filters, column configurations, and share them across your team.
          </p>
        </div>

        <button
          onClick={() => dispatch(openSaveModal())}
          className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-amber-500 transition-colors"
        >
          <BookmarkPlus className="h-4 w-4" />
          <span>Save Current Exploration View</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading saved views...</div>
      ) : views.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center text-xs text-slate-400">
          No saved views created for this dataset yet. Configure filters in Data Explorer and click &quot;Save View&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {views.map((v) => (
            <div
              key={v.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-100 text-sm">{v.name}</h3>
                  {v.isShared && (
                    <span className="flex items-center gap-1 rounded bg-blue-900/40 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-800/50">
                      <Share2 className="h-3 w-3" /> Shared
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                  {v.description || "No description provided."}
                </p>

                <div className="mt-4 space-y-2 rounded-xl bg-slate-950/60 p-3 border border-slate-800/60 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Filter className="h-3 w-3 text-slate-400" /> Active Rules:
                    </span>
                    <strong className="text-slate-200">{v.filters?.length || 0} filters</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Sort Order:</span>
                    <span className="text-slate-200">
                      {v.sortingConfig && v.sortingConfig.length > 0
                        ? `${v.sortingConfig[0].column} (${v.sortingConfig[0].direction})`
                        : "Default"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" /> Created:
                    </span>
                    <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleDelete(v.id)}
                  className="rounded p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Delete view"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => handleApplyView(v)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Apply & Explore</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
