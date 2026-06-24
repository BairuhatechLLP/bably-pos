import {createSlice} from '@reduxjs/toolkit';

const AuthSlice = createSlice({
  name: 'Auth',
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

    setCredential: (state: any, action: any) => {
      state.credential = action.payload;
    },

    clearCredential: (state: any) => {
      state.credential = {};
    },
    logout: (state: any) => {
      state.auth = false;
      state.user = {};
      state.authToken = null;
    },
    setToken: (state: any, action) => {
      state.authToken = action.payload;
    },
    setTokenInUser: (state: any, action) => {
      state.user = {...state.user,token:action.payload}
    },
  },
});

export const {
  login,
  logout,
  saveData,
  setToken,
  setCredential,
  clearCredential,
  setTokenInUser
} = AuthSlice.actions;

export default AuthSlice.reducer;

