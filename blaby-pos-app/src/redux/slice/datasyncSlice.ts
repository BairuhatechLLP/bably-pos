import {createSlice} from '@reduxjs/toolkit';

const DatasyncSlice = createSlice({
  name: 'Datasync',
  initialState: {
    last_synced: null,
    quickAccess: [],
  },
  reducers: {
    saveLastSynced: (state, action) => {
      state.last_synced = action.payload;
    },
    addquickAccess: (state: any, action) => {
      const newItem: any = action.payload;
      const exists = state.quickAccess.some(
        (item: any) => item.id === newItem.id,
      );
      if (!exists) {
        state.quickAccess.push(newItem);
      }
    },
    removequickAccess: (state, action) => {
      const itemId = action.payload;
      state.quickAccess = state.quickAccess.filter(
        (item: any) => item?.id !== itemId?.id,
      );
    },
    clearquickAccess: (state, action) => {
      state.quickAccess = [];
    },
    clearAllData: state => {
      state.last_synced = null;
      state.quickAccess = [];
    },
  },
});
export const {
  saveLastSynced,
  clearAllData,
  addquickAccess,
  removequickAccess,
  clearquickAccess,
} = DatasyncSlice.actions;
export default DatasyncSlice.reducer;
