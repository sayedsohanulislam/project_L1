import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SavedView } from "@/types";

interface SavedViewsState {
  activeViewId: string | null;
  activeView: SavedView | null;
  isSaveModalOpen: boolean;
  isShareModalOpen: boolean;
}

const initialState: SavedViewsState = {
  activeViewId: null,
  activeView: null,
  isSaveModalOpen: false,
  isShareModalOpen: false,
};

export const savedViewsSlice = createSlice({
  name: "savedViews",
  initialState,
  reducers: {
    setActiveView: (state, action: PayloadAction<SavedView | null>) => {
      state.activeView = action.payload;
      state.activeViewId = action.payload ? action.payload.id : null;
    },
    openSaveModal: (state) => {
      state.isSaveModalOpen = true;
    },
    closeSaveModal: (state) => {
      state.isSaveModalOpen = false;
    },
    openShareModal: (state) => {
      state.isShareModalOpen = true;
    },
    closeShareModal: (state) => {
      state.isShareModalOpen = false;
    },
  },
});

export const {
  setActiveView,
  openSaveModal,
  closeSaveModal,
  openShareModal,
  closeShareModal,
} = savedViewsSlice.actions;

export default savedViewsSlice.reducer;
