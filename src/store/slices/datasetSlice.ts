import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Dataset, DatasetField } from "@/types";

interface DatasetState {
  activeDatasetId: string | null;
  activeDataset: Dataset | null;
  fields: DatasetField[];
  pinnedRecordIds: string[];
}

const initialState: DatasetState = {
  activeDatasetId: null,
  activeDataset: null,
  fields: [],
  pinnedRecordIds: [],
};

export const datasetSlice = createSlice({
  name: "dataset",
  initialState,
  reducers: {
    setActiveDatasetId: (state, action: PayloadAction<string>) => {
      state.activeDatasetId = action.payload;
    },
    setActiveDataset: (state, action: PayloadAction<Dataset | null>) => {
      state.activeDataset = action.payload;
      if (action.payload) {
        state.activeDatasetId = action.payload.id;
      }
    },
    setFields: (state, action: PayloadAction<DatasetField[]>) => {
      state.fields = action.payload;
    },
    togglePinRecord: (state, action: PayloadAction<string>) => {
      const idx = state.pinnedRecordIds.indexOf(action.payload);
      if (idx >= 0) {
        state.pinnedRecordIds.splice(idx, 1);
      } else {
        state.pinnedRecordIds.push(action.payload);
      }
    },
    clearPinnedRecords: (state) => {
      state.pinnedRecordIds = [];
    },
  },
});

export const {
  setActiveDatasetId,
  setActiveDataset,
  setFields,
  togglePinRecord,
  clearPinnedRecords,
} = datasetSlice.actions;

export default datasetSlice.reducer;
