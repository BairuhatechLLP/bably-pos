import {createSlice} from '@reduxjs/toolkit';

const DropdownSlice = createSlice({
  name: 'Dropdown',
  initialState: {
    branches: [],
  },
  reducers: {
    saveBranch: (state: any, action: any) => {
      state.branches = action?.payload;
    },

    clear: (state: any, action: any) => {
      state.branches = [];
    },
  },
});

export const {saveBranch, clear} = DropdownSlice.actions;

export default DropdownSlice.reducer;
