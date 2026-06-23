import {createSlice} from '@reduxjs/toolkit';

const SettingsSlice = createSlice({
  name: 'Settings',
  initialState: {
    showImage: true,
    tokenGenerate: false,
    quickArea: false,
    printCount: "1",
    netwrok:true
  },
  reducers: {
    setShowImage: (state, action) => {
      state.showImage = action.payload;
    },
    setTokenGenerate: (state, action) => {
      state.tokenGenerate = action.payload;
    },
    setQuickArea: (state, action) => {
      state.quickArea = action.payload;
    },
    setPrintCount: (state, action) => {
      state.printCount = action.payload;
    },
    setNetwrok: (state, action) => {
      state.netwrok = action.payload;
    },
    clearSettings: state => {
      state.showImage = true;
      state.tokenGenerate = false;
      state.quickArea = false;
      state.printCount = "1";
    },
  },
});
export const {
  setShowImage,
  setTokenGenerate,
  setQuickArea,
  setPrintCount,
  setNetwrok,
  clearSettings,
} = SettingsSlice.actions;
export default SettingsSlice.reducer;
