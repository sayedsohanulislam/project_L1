"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { closeSaveModal } from "@/store/slices/savedViewsSlice";
import { useCreateSavedViewMutation } from "@/store/services/api";
import { BookmarkPlus, X, Check } from "lucide-react";

export function SaveViewModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.savedViews.isSaveModalOpen);
  const activeDatasetId = useAppSelector((state) => state.dataset.activeDatasetId);
  const searchConfig = useAppSelector((state) => state.searchConfig);
  const ui = useAppSelector((state) => state.uiPreference);
  const user = useAppSelector((state) => state.auth.user);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [createSavedView, { isLoading }] = useCreateSavedViewMutation();

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeDatasetId) return;

    try {
      const visibleCols = Object.entries(ui.visibleColumns)
        .filter(([, v]) => v)
        .map(([k]) => k);

      await createSavedView({
        name: name.trim(),
        description: description.trim(),
        datasetId: activeDatasetId,
        createdById: user?.id || "00000000-0000-0000-0000-000000000000",
        searchConditions: { query: searchConfig.query },
        filters: searchConfig.filters,
        sortingConfig: searchConfig.sorting,
        visibleColumns: visibleCols,
        isShared,
      }).unwrap();

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setName("");
        setDescription("");
        dispatch(closeSaveModal());
      }, 1000);
    } catch (err) {
      console.error("Save view failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookmarkPlus className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">Save Current View</h3>
          </div>
          <button
            onClick={() => dispatch(closeSaveModal())}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-emerald-400">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-950 border border-emerald-800/60 mb-3">
              <Check className="h-6 w-6 text-emerald-400" />
            </div>
            <p className="font-semibold text-sm">View Saved Successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                View Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q4 High-Yield German Accounts"
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add context or notes for team members..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <p className="font-semibold text-slate-400 mb-1">Included in this configuration:</p>
              <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                <li>Search Query: <span className="text-slate-200">{searchConfig.query || "(None)"}</span></li>
                <li>Compound Filters: <span className="text-slate-200">{searchConfig.filters.length} rules</span></li>
                <li>Sorting: <span className="text-slate-200">{searchConfig.sorting.map(s => `${s.column} ${s.direction}`).join(", ")}</span></li>
              </ul>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
              />
              <span className="text-slate-300">Share with authorized team members</span>
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => dispatch(closeSaveModal())}
                className="rounded-lg border border-slate-800 px-3 py-1.5 font-medium text-slate-400 hover:bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="rounded-lg bg-blue-600 px-4 py-1.5 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save View"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
