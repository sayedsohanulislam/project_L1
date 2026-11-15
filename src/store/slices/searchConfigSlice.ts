import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FilterCondition, SortCondition } from "@/types";

interface SearchConfigState {
  query: string;
  searchMethod: "FULL_TEXT" | "TRIGRAM" | "EXACT";
  filters: FilterCondition[];
  sorting: SortCondition[];
  page: number;
  pageSize: number;
  highlightMatches: boolean;
}

const initialState: SearchConfigState = {
  query: "",
  searchMethod: "FULL_TEXT",
  filters: [],
  sorting: [{ column: "recordNumber", direction: "asc" }],
  page: 1,
  pageSize: 25,
  highlightMatches: true,
};

export const searchConfigSlice = createSlice({
  name: "searchConfig",
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
      state.page = 1; // Reset to page 1 on new search
    },
    setSearchMethod: (
      state,
      action: PayloadAction<"FULL_TEXT" | "TRIGRAM" | "EXACT">
    ) => {
      state.searchMethod = action.payload;
      state.page = 1;
    },
    addFilter: (state, action: PayloadAction<FilterCondition>) => {
      state.filters.push(action.payload);
      state.page = 1;
    },
    updateFilter: (
      state,
      action: PayloadAction<{ id: string; filter: Partial<FilterCondition> }>
    ) => {
      const idx = state.filters.findIndex((f) => f.id === action.payload.id);
      if (idx !== -1) {
        state.filters[idx] = { ...state.filters[idx], ...action.payload.filter };
        state.page = 1;
      }
    },
    removeFilter: (state, action: PayloadAction<string>) => {
      state.filters = state.filters.filter((f) => f.id !== action.payload);
      state.page = 1;
    },
    clearFilters: (state) => {
      state.filters = [];
      state.page = 1;
    },
    setSorting: (state, action: PayloadAction<SortCondition[]>) => {
      state.sorting = action.payload;
    },
    toggleColumnSort: (
      state,
      action: PayloadAction<{ column: string; multi?: boolean }>
    ) => {
      const { column, multi } = action.payload;
      const existing = state.sorting.find((s) => s.column === column);

      if (!multi) {
        // Single column toggle
        if (!existing) {
          state.sorting = [{ column, direction: "asc" }];
        } else if (existing.direction === "asc") {
          state.sorting = [{ column, direction: "desc" }];
        } else {
          state.sorting = [{ column: "recordNumber", direction: "asc" }];
        }
      } else {
        // Multi-column sorting
        if (!existing) {
          state.sorting.push({ column, direction: "asc" });
        } else if (existing.direction === "asc") {
          existing.direction = "desc";
        } else {
          state.sorting = state.sorting.filter((s) => s.column !== column);
          if (state.sorting.length === 0) {
            state.sorting = [{ column: "recordNumber", direction: "asc" }];
          }
        }
      }
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = Math.max(1, action.payload);
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1;
    },
    setHighlightMatches: (state, action: PayloadAction<boolean>) => {
      state.highlightMatches = action.payload;
    },
    applySavedConfig: (
      state,
      action: PayloadAction<{
        query?: string;
        filters: FilterCondition[];
        sorting: SortCondition[];
      }>
    ) => {
      state.query = action.payload.query || "";
      state.filters = action.payload.filters;
      state.sorting = action.payload.sorting.length
        ? action.payload.sorting
        : [{ column: "recordNumber", direction: "asc" }];
      state.page = 1;
    },
    resetSearch: (state) => {
      state.query = "";
      state.filters = [];
      state.sorting = [{ column: "recordNumber", direction: "asc" }];
      state.page = 1;
    },
  },
});

export const {
  setQuery,
  setSearchMethod,
  addFilter,
  updateFilter,
  removeFilter,
  clearFilters,
  setSorting,
  toggleColumnSort,
  setPage,
  setPageSize,
  setHighlightMatches,
  applySavedConfig,
  resetSearch,
} = searchConfigSlice.actions;

export default searchConfigSlice.reducer;
