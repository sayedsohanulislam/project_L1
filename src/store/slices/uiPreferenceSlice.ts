import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiPreferenceState {
  theme: "dark" | "light";
  sidebarCollapsed: boolean;
  tableDensity: "compact" | "standard" | "comfortable";
  visibleColumns: Record<string, boolean>;
  columnWidths: Record<string, number>;
  selectedRecordIds: string[];
  inspectorRecordId: string | null;
  virtualizationEnabled: boolean;
}

const DEFAULT_VISIBLE_COLUMNS: Record<string, boolean> = {
  recordNumber: true,
  companyName: true,
  status: true,
  country: true,
  industry: true,
  revenue: true,
  riskScore: true,
  contractTier: true,
  department: true,
  contactEmail: true,
  createdAt: true,
};

const initialState: UiPreferenceState = {
  theme: "dark",
  sidebarCollapsed: false,
  tableDensity: "compact",
  visibleColumns: DEFAULT_VISIBLE_COLUMNS,
  columnWidths: {
    recordNumber: 90,
    companyName: 240,
    status: 120,
    country: 150,
    industry: 160,
    revenue: 140,
    riskScore: 110,
    contractTier: 130,
    department: 140,
    contactEmail: 220,
    createdAt: 130,
  },
  selectedRecordIds: [],
  inspectorRecordId: null,
  virtualizationEnabled: true,
};

export const uiPreferenceSlice = createSlice({
  name: "uiPreference",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
    setTheme: (state, action: PayloadAction<"dark" | "light">) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setTableDensity: (
      state,
      action: PayloadAction<"compact" | "standard" | "comfortable">
    ) => {
      state.tableDensity = action.payload;
    },
    toggleColumnVisibility: (state, action: PayloadAction<string>) => {
      const col = action.payload;
      state.visibleColumns[col] = !state.visibleColumns[col];
    },
    setColumnVisibilityMap: (
      state,
      action: PayloadAction<Record<string, boolean>>
    ) => {
      state.visibleColumns = action.payload;
    },
    setColumnWidth: (
      state,
      action: PayloadAction<{ column: string; width: number }>
    ) => {
      state.columnWidths[action.payload.column] = Math.max(
        60,
        action.payload.width
      );
    },
    toggleSelectRecord: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const idx = state.selectedRecordIds.indexOf(id);
      if (idx >= 0) {
        state.selectedRecordIds.splice(idx, 1);
      } else {
        state.selectedRecordIds.push(id);
      }
    },
    selectAllRecords: (state, action: PayloadAction<string[]>) => {
      state.selectedRecordIds = action.payload;
    },
    clearSelection: (state) => {
      state.selectedRecordIds = [];
    },
    setInspectorRecordId: (state, action: PayloadAction<string | null>) => {
      state.inspectorRecordId = action.payload;
    },
    toggleVirtualization: (state) => {
      state.virtualizationEnabled = !state.virtualizationEnabled;
    },
    resetColumns: (state) => {
      state.visibleColumns = DEFAULT_VISIBLE_COLUMNS;
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setTableDensity,
  toggleColumnVisibility,
  setColumnVisibilityMap,
  setColumnWidth,
  toggleSelectRecord,
  selectAllRecords,
  clearSelection,
  setInspectorRecordId,
  toggleVirtualization,
  resetColumns,
} = uiPreferenceSlice.actions;

export default uiPreferenceSlice.reducer;
