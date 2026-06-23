import {createSlice} from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    auth: false,
    user: null,
    authToken: 'null',
    credential: {},
  },
  reducers: {
    login: (state: any, action: any) => {
      (state.auth = true), (state.user = action?.payload);
    },
    saveData: (state: any, action: any) => {
      state.user = action?.payload;
    },

    update: (state: any, action: any) => {
      state.user = action.payload;
    },

    setToken: (state: any, action) => {
      state.authToken = action.payload;
    },
    setTokenInUser: (state: any, action) => {
      state.user = {...state.user,token:action.payload}
    },
    logout: (state: any) => {
      state.auth = false;
      state.user = {};
      state.authToken = null;
      state.credential = {};
    },
  },
});

export const {
  login,
  logout,
  saveData,
  setToken,
  update,
  setTokenInUser
} = authSlice.actions;

export const selectUser = (state: any) => state.auth.user;
export default authSlice.reducer;

